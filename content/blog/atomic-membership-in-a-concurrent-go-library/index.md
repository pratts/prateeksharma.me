---
title: "Two-sided membership needs one lock, not two"
date: 2026-08-27
draft: false
description: "A bidirectional relationship — users know their rooms, rooms know their users — has to be updated under a single lock, or readers will catch it half-done."
categories: [Systems, Programming]
tags: [Go, Concurrency, Data Structures, Real-time Systems]
related:
  - /projects/goroomlib/
---

[Goroomlib](/projects/goroomlib/) models a relationship that points both ways: a
`Room` holds a map of its users, and each `User` holds a list of the rooms it's
in. That redundancy is deliberate — both lookups need to be O(1) — but it's also
the whole bug surface.

## The first version

`AddUserToRoom` did the obvious thing:

```go
func (s *RoomService) AddUserToRoom(roomName string, user *User) {
    room := s.rooms[roomName]

    room.mu.Lock()
    room.users[user.ID] = user
    room.mu.Unlock()

    user.mu.Lock()
    user.joinedRooms = append(user.joinedRooms, roomName)
    user.mu.Unlock()
}
```

Each side is individually locked, so `go vet` and the race detector on a simple
test are both happy. But there's a window between the two critical sections where
the room says "user is here" and the user says "I'm not in that room." Anything
that reads both — say, a disconnect handler that walks `user.joinedRooms` to
remove the user from each — can run in that window and leak the membership.

Under load this stopped being theoretical. A join and a disconnect for the same
user, on two goroutines, could interleave so the disconnect walked a
`joinedRooms` list that didn't yet contain the room the join was about to add.

## The fix: one lock covering both sides

The relationship is one fact, so it needs one critical section:

```go
func (s *RoomService) AddUserToRoom(roomName string, user *User) {
    s.mu.Lock()
    defer s.mu.Unlock()

    room := s.rooms[roomName]
    room.users[user.ID] = user
    user.joinedRooms = append(user.joinedRooms, roomName)
}
```

`RemoveUserFromRoom` mirrors it. Now no goroutine can observe the room and the
user disagreeing about membership, because no goroutine can run while one side is
updated and the other isn't.

## The second rule: don't hand out the internals

Locking the writes isn't enough if reads escape the lock. Accessors like
`GetJoinedRooms` and `GetUserMap` return **copies**:

```go
func (u *User) GetJoinedRooms() []string {
    u.mu.RLock()
    defer u.mu.RUnlock()
    out := make([]string, len(u.joinedRooms))
    copy(out, u.joinedRooms)
    return out
}
```

If they returned the live slice or map, a caller ranging over "the rooms this
user is in" outside any lock would race with the next `AddUserToRoom`. Copying at
the boundary is cheap here (memberships are small) and it means callers can't
create a data race even if they try.

## Takeaway

If you denormalize a relationship for lookup speed, the writes to both
representations are a single atomic operation — lock once, update both, unlock —
and every read of the shared structure either holds the lock or gets a copy.
There's no "mostly consistent" version of this that survives contention.
