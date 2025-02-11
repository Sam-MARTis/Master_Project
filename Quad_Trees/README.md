# Quad tree 

Try the demo: [https://sam-martis.github.io/QuadTrees/](https://sam-martis.github.io/QuadTrees/)

Move your mouse to insert particles during the first four second.

Once the 4 second time is up, click on the screen to query a rectangular region around click for objects


## Why use it?
While creating simulations, one often needs to take into account the effect of one particle on another.

The naive approach would be to check every particle against every other particle for their interaction. However this results in time complexity of $O(n^2)$

Clearly, a better approach is needed for larger simulations.



## How do k-d trees help?
k-d trees spatial data-structure, encoding the position of it's contents within it.

it is often useful to efficiently loop over only certain regions of the simulation space rather than the entire region. EX: In collision detection, we only need to check the surrounding region of the particle in question rather than the entire region.

As such, k-d trees come in handy. They work by dividing space into regions(sub-trees) Where each leaf node contains only $n$ particles(n is fixed before hand. Usually 2-6). 

If a leaf node conatins more then $n$ particles, then the node splits and becomes a branch for k number of leaf nodes. In case of a Quad-tree, the node splits into four when dividing.

Constructing a tree and querying from the tree has a time complexity of $O(n\log n)$ and $O(\log n)$ respectively

k-d trees are crucial in implementing of Barnes-Hut algorithm for N-body gravity simulations, reducing the time complexity from $O(n^2)$ to $O(n\log(n))$

Additionally, they can greatly improve collision detection by simply querying a small region around the object in question.


Feel free to use the above code in your own projects! 