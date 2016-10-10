# NavMeshJS
JS implementation of Automatic Generation of Suboptimal NavMeshes - Ramon Olivia, Nuria Pelechano
http://www.cs.upc.edu/~npelechano/Oliva_MIG2011.pdf

# Use
Open index.html and draw a polygon. Use the options at the bottom of the page to play around with splitting the polygon into convex polygons using the various parts of the algorithm described by Olivia and Pelechano.

Note: Whilst you can draw such that lines cross, that will produce bad results.

# Status
Currently breaks the polygon into the set of convex polygons and draws them, however the new polygons are not stored or created as objects. Also there is no support for drawing polygons with holes.
