# NavMeshJS
JS implementation of Automatic Generation of Suboptimal NavMeshes - Ramon Olivia, Nuria Pelechano
http://www.cs.upc.edu/~npelechano/Oliva_MIG2011.pdf
. The purpose of the project is for anyone looking to implement the algorithm to have a codified version of the base algorithm to work from. Having such a reference will hopefully aid in the understanding of the paper itself. By no means is the project fit for production use, nor does it necessarily implement best coding practices, and it should be used at the users own discretion.

# Use
Open index.html and draw a polygon. Use the options at the bottom of the page to play around with splitting the polygon into convex polygons using the various parts of the algorithm described by Olivia and Pelechano.

Note: Whilst you can draw such that lines cross, that will produce bad results.

# Implementation Notes
 - Breaks the polygon into the set of convex polygons and draws them, however it is only the new line segments being drawn. The new polygon data is not stored. This should be easy enough for the user to implement themselves.
 - There is no support for drawing polygons with holes.
