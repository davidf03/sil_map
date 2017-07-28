# sil_map
```
Interactive map prototype

This codebase is from an experimental project aimed at mapping individuals' geographic activity over time.
It began as an undertaking of design, but ended up piquing my curiousity as to how it might actually be implemented.

What makes this project so interesting for me is how there is no explicitly defined 'absolute' time-line, but rather there is an array of indices each corresponding to a movement of a character from one point to another, and the time information carried is the length of time since the last movement _began_ as well as the duration of this movement.
The display of characters on a given locations is constructed out of these interactions among indices in the time array.

While the design would not work at scale without modification, it is still I think a thought-provoking piece.
This project was incredibly challenging and one of the most rewarding programming endeavours I have ever made to undertake.

Visit the demo here: https://dfriesen1183.github.io/sil_map/
```
