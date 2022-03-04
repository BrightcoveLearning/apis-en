# Writing good policies

Nomic keys are like semi-public passwords; customers distribute these
keys with their players, so they cannot be considered private, but we
do try to make them a little hard to use outside of their intended
context. 

The main things to understand about policy keys:

- Each key can only be used to play videos from the account it was
  created under.
- A key created for one player can potentially be used in a different
  player and on a different website if care is not taken.
- Policy keys only encode domain restrictions at this point. All other
  restrictions are derived from account and video settings.

To understand how player keys can be misused, consider the following
scenario:

The Acme Corporation creates player #1 for a few of their viral videos
and encourages people to embed this on their own sites. The player's
policy key (`BCpk123`) does not have domain restrictions. Acme then
publishes some instructional videos in player #2 with a policy key
(`BCpk456`) that has domain restrictions only permitting playback on
`https://acme.example.com`.

This works fine until some enterprising soul extracts policy key
`BCpk123` from player #1 and uses it in a player on their own site to
play the instructional videos. Now a wide audience can see those
videos, and playback is not blocked because the permissive policy key
has been used.

The only way for Acme to prevent this scenario is to *only create*
policy keys that have domain restrictions. (When we implement
single-video policy keys, the same advice will apply.)

It is expected that most publishers will not use domain restrictions
since it is only a very weak form of security.

In the future we may wish to make it more difficult to make this mistake:

- For Studio users, make it easy to produce players with uniform policy keys.
- Document this pitfall for other users. ("All players on an account
  should be domain-restricted, or none of them. Similarly for video-ID
  restriction.")
- Build a data store for nomic so that videos can have policies stored
  in nomic rather than specified on the player policy keys.

The most important restrictions are not carried on the key: For
example, a locked account's videos will be denied, and TVE and IP
restrictions are always applied.
