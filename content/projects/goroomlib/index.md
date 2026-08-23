+++
date = '2026-08-23T00:00:00+05:30'
draft = false
title = 'Goroomlib'

readTime = true
autonumber = false
tags = ["Go", "Concurrency", "Real-time Systems", "Library"]
showTags = true
hideBackToTop = true

parent = "projects"
ancestor = "projects"
+++

Across the poker platforms I've worked on at Adda52 and Mind Sports League, one shape kept showing up: users joining a table, leaving it, sending messages to everyone at it, and the server keeping track of who's where. Every time I touched a new real-time feature, I ended up rewriting the same User and Room bookkeeping from scratch. I wanted to pull that pattern out once, get it right, and stop reimplementing it.

That's how [Goroomlib](https://github.com/pratts/goroomlib) started — a small Go library that provides a reusable Room-User architecture for anything room-shaped: chat apps, multiplayer games, poker tables.

I wanted the library to do a few things well:
1. Let a consumer create rooms and users without worrying about the bookkeeping of who's in which room.
2. Be safe to call from many goroutines at once, since real-time servers are inherently concurrent.
3. Stay unopinionated about what actually happens on a join, leave, or message — the library shouldn't need to know or care what a "poker table" or a "chat room" does with that event.

The first two were straightforward: a `RoomService` and `UserService`, each backed by a map protected by a mutex. The third one needed more thought.

## Making It Extensible Without Making It Opinionated

The obvious trap with a library like this is baking in assumptions about what a "room" is for. I didn't want Goroomlib to know anything about poker hands or chat messages — just membership and message passing. So instead of hardcoding behavior, I added a `RoomExtension` hook interface that consumers implement to react to room-level events:

```go
type MyRoomExtension struct{}

func (ext *MyRoomExtension) OnUserJoin(room *goroomlib.Room, user *goroomlib.User) {
    fmt.Printf("User %s joined room %s\n", user.GetName(), room.GetRoomName())
}

func (ext *MyRoomExtension) OnUserLeave(room *goroomlib.Room, user *goroomlib.User) {
    fmt.Printf("User %s left room %s\n", user.GetName(), room.GetRoomName())
}

room := roomService.CreateRoomWithExtension("extended", 10, extension)
```

There's a matching `AppExtension` at the top level for events that aren't scoped to a single room — a new user connecting, or a message aimed at the app rather than a room. This split let me keep the library itself dumb about domain logic while still giving callers a place to hang their own behavior.

## The Concurrency Problem That Actually Bit Me

The trickiest part wasn't the API — it was making sure a user's view of "which rooms am I in" never disagreed with a room's view of "who's currently joined." Early on, I had `AddUserToRoom` update the room's user map and then separately update the user's joined-rooms list. Under concurrent calls, it was possible for one of those two updates to land while the other was still in flight, leaving the two data structures briefly (or not so briefly) out of sync.

The fix was to make membership changes atomic: `AddUserToRoom` and `RemoveUserFromRoom` now acquire the lock once and update both sides of the relationship before releasing it. Nothing else is allowed to observe a half-updated state.

The other rule I had to enforce on myself: never hand out the internal maps directly. Accessors like `GetUserMap` and `GetJoinedRooms` return copies, not live references — otherwise a caller iterating over "users in this room" outside a lock could race with an `AddUserToRoom` call happening on another goroutine.

## Room Names as the Identity Boundary

I made room names unique across the whole system rather than introducing a separate handle for lookups. `CreateRoom` returns `nil` if the name is already taken, and `IsRoomNameAvailable` lets a caller check before attempting creation:

```go
if roomService.IsRoomNameAvailable("mychatroom") {
    room := roomService.CreateRoom("mychatroom", 10)
} else {
    fmt.Println("Room name 'mychatroom' is already taken")
}
```

It's a simple constraint, but it meant I didn't need to design a separate ID-vs-name lookup story, and callers get an obvious, explicit failure mode instead of silently overwriting an existing room.

## Where It's Landed

Goroomlib is intentionally small — it doesn't try to be a full game server framework, just the membership and messaging primitives that real-time, room-based systems all seem to need. That's also what makes it easy to drop into a new project: initialize the services, wire up an extension if you need domain-specific behavior, and the room/user lifecycle is already handled and safe under concurrent access.

## Links
- [GitHub Repository](https://github.com/pratts/goroomlib)
