var polygon;
var meshGen;
// Only executed our code once the DOM is ready.
window.onload = function() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');

    canvas.width = 800;
    canvas.height = 500;

    // Create an empty project and a view for the canvas:
    paper.setup(canvas);

    polygon = Poly(paper);
    meshGen = MeshGenerator();

    document.getElementById('myCanvas').addEventListener('click',function(evt){
        var point = PolyPoint({
            x:evt.clientX - 5,
            y:evt.clientY - 5,
        }, paper);
        polygon.addPoint(point);
        paper.view.draw();
    },false);

    /*var points = [
    {x: 300, y: 109},
    {x: 342, y: 177},
    {x: 302, y: 224},
    {x: 202, y: 302},
    {x: 204, y: 222},
    //{x: 228, y: 149},
    {x: 234, y: 116},
    //{x: 163, y: 95},
    {x: 82, y: 91},
    //{x: 83, y: 204},
    //{x: 88, y: 295},
    //{x: 91, y: 339},
    {x: 86, y: 378},
    {x: 137, y: 407},
    {x: 251, y: 405},
    //{x: 371, y: 394},
    {x: 458, y: 375},
    {x: 552, y: 262},
    {x: 586, y: 134},
    {x: 598, y: 45},
    {x: 357, y: 4},
    //{x: 83, y: 12},
    //{x: 48, y: 16},
    {x: 13, y: 22},
    //{x: 27, y: 49},
    {x: 30, y: 57}
    ];

    for (var i = 0; i < points.length; i ++){
        var point = PolyPoint(points[i], paper);
        polygon.addPoint(point);
    }*/

    paper.view.draw();
}

function resetPointColor(points){
    for (var i = 0; i < points.length; i ++){
        points[i].setColor("black");
        points[i].draw();
    }
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function drawEdge(edge){
    var myPath = new paper.Path({
        segments: [[edge[0].x(), edge[0].y()], [edge[1].x(), edge[1].y()]]
    });

    myPath.strokeColor = "#FF8C00";

    myPath.strokeWidth = 2;
    paper.view.draw();
    return myPath;
}

function drawPoint(point){

    var circle = new paper.Path.Circle(new paper.Point(point.x(), point.y()), 5);
    circle.fillColor = "#FF8C00";
    paper.view.draw();

    return circle;
}


function highlightIiPoints(){
    var concavePoints = polygon.concavePoints();
    var points = polygon.points;

    resetPointColor(points);

    for (var i = 0; i < concavePoints.length; i ++){
        var index = concavePoints[i];
        var pointsInIIndex = meshGen.getPointsInIi(polygon, index);
        for (var j = 0; j < pointsInIIndex.length; j ++){
            pointsInIIndex[j].setColor('#00FA9A');
            pointsInIIndex[j].draw();
        }
    }
    paper.view.draw();
}

function highlightConcavePoints(){
    var concavePoints = polygon.concavePoints();
    var points = polygon.points;

    resetPointColor(points);

    for (var i = 0; i < concavePoints.length; i ++){
        var index = concavePoints[i];
        points[index].setColor("red");
        points[index].draw();
    }
    paper.view.draw();
}

function solveWithClosestVertex(){
    var concavePoints = polygon.concavePoints();
    var points = polygon.points;

    for (var i = 0; i < concavePoints.length; i ++){
        var index = concavePoints[i];
        var pointsInIIndex = meshGen.getPointsInIi(polygon, index);
        var minDistance = 1000000000;
        var minDistancePoint = null;
        for (var j = 0; j < pointsInIIndex.length; j ++){
            var distance = points[index].distance2(pointsInIIndex[j]);
            if (distance < minDistance){
                minDistancePoint = pointsInIIndex[j];
                minDistance = distance;
            }
        }
        if (minDistancePoint != null){
            var myPath = new paper.Path({
                segments: [[points[index].x(), points[index].y()], [minDistancePoint.x(), minDistancePoint.y()]]
            });

            myPath.strokeColor = "#FF8C00";

            myPath.strokeWidth = 2;
        }
    }

    paper.view.draw();
}

function solveWithClosestEdge(){
    var concavePoints = polygon.concavePoints();
    var points = polygon.points;
    var pointsLen = points.length;

    for (var i = 0; i < concavePoints.length; i ++){
        var index = concavePoints[i];
        var edgesInIIndex = meshGen.getEdgesInIi(polygon, index);
        var minDistance = 1000000000;
        var minDistancePoint = null;
        for (var j = 0; j < edgesInIIndex.all.length; j ++){
            var edge = edgesInIIndex.all[j];
            var projectionPoint = meshGen.projectPointToLineSegment(edge[0], edge[1], points[index]);


            var runIntersectionCheck = false;
            var edgeOfIi;
            if (contains(edgesInIIndex.partialIntersectionE1, edge)){
                runIntersectionCheck = true;
                edgeOfIi = 0;
            }
            else if (contains(edgesInIIndex.partialIntersectionE2, edge)){
                runIntersectionCheck = true;
                edgeOfIi = 1;
            }

            if (runIntersectionCheck){
                var line1 = [
                    points[(pointsLen+index-1)%pointsLen],
                    points[index],
                ];
                var line2 = [
                    points[index],
                    points[(index+1)%pointsLen],
                ];

                if (!meshGen.isPointBetweenSegments(line1, line2, projectionPoint, polygon.orientation())){
                    if (edgeOfIi == 0){
                        projectionPoint = meshGen.getIntersectionPoint(line1, edge);
                    }else{
                        projectionPoint = meshGen.getIntersectionPoint(line2, edge);
                    }
                }
            }

            var distance = points[index].distance2(projectionPoint);
            if (distance < minDistance){
                minDistancePoint = projectionPoint;
                minDistance = distance;
            }
        }

        var myPath = new paper.Path({
            segments: [[points[index].x(), points[index].y()], [minDistancePoint.x(), minDistancePoint.y()]]
        });

        myPath.strokeColor = "#FF1493";

        myPath.strokeWidth = 2;
    }

    paper.view.draw();
}


function solveCombined(){
    var concavePoints = polygon.concavePoints();
    var points = polygon.points;
    var pointsLen = points.length;
    var portals = [];

    for (var i = 0; i < concavePoints.length; i ++){
        var index = concavePoints[i];
        var pointsInIIndex = meshGen.getPointsInIi(polygon, index);
        var minDistance = 1000000000;
        var minDistancePoint = null;
        for (var j = 0; j < pointsInIIndex.length; j ++){
            var distance = points[index].distance2(pointsInIIndex[j]);
            if (distance < minDistance){
                minDistancePoint = pointsInIIndex[j];
                minDistance = distance;
            }
        }

        var edgesInIIndex = meshGen.getEdgesInIi(polygon, index);
        for (var j = 0; j < edgesInIIndex.all.length; j ++){
            var edge = edgesInIIndex.all[j];
            var projectionPoint = meshGen.projectPointToLineSegment(edge[0], edge[1], points[index]);

            var runIntersectionCheck = false;
            var edgeOfIi;
            if (contains(edgesInIIndex.partialIntersectionE1, edge)){
                runIntersectionCheck = true;
                edgeOfIi = 0;
            }
            else if (contains(edgesInIIndex.partialIntersectionE2, edge)){
                runIntersectionCheck = true;
                edgeOfIi = 1;
            }

            if (runIntersectionCheck){
                var line1 = [
                    points[(pointsLen+index-1)%pointsLen],
                    points[index],
                ];
                var line2 = [
                    points[index],
                    points[(index+1)%pointsLen],
                ];

                if (!meshGen.isPointBetweenSegments(line1, line2, projectionPoint, polygon.orientation())){
                    if (edgeOfIi == 0){
                        projectionPoint = meshGen.getIntersectionPoint(line1, edge);
                    }else{
                        projectionPoint = meshGen.getIntersectionPoint(line2, edge);
                    }
                }
            }

            var distance = points[index].distance2(projectionPoint);
            if (distance < minDistance){
                minDistancePoint = projectionPoint;
                minDistance = distance;
            }
        }

        var isClosestPointPortal = false;
        var closestPortal;

        var line1 = [
            points[(pointsLen+index-1)%pointsLen],
            points[index],
        ];
        var line2 = [
            points[index],
            points[(index+1)%pointsLen],
        ];

        for (var j = 0; j < portals.length; j ++){
            var edge = portals[j];
            var projectionPoint = meshGen.projectPointToLineSegment(edge[0], edge[1], points[index]);

            //Need to do checks here.

            var distance = points[index].distance2(projectionPoint);
            if (distance < minDistance && meshGen.isEdgeBetweenSegments(line1, line2, edge, polygon.orientation()).isBetween){
                minDistancePoint = projectionPoint;
                minDistance = distance;
                isClosestPointPortal = true;
                closestPortal = edge;
            }
        }

        if (isClosestPointPortal){

            var p1BetweenLines = meshGen.isPointBetweenSegments(line1, line2, closestPortal[0], polygon.orientation());
            var p2BetweenLines = meshGen.isPointBetweenSegments(line1, line2, closestPortal[1], polygon.orientation());

            if (p1BetweenLines && !p2BetweenLines){
                minDistancePoint = [closestPortal[0]];
            }
            else if (!p1BetweenLines && p2BetweenLines){
                minDistancePoint = [closestPortal[1]];
            }
            else if (!p1BetweenLines && !p2BetweenLines){
                minDistancePoint = closestPortal;
            }

        }
        else{
            minDistancePoint = [minDistancePoint];
        }


        if (minDistancePoint != null){
            for (var j = 0; j < minDistancePoint.length; j ++){
                portals.push([
                    PolyPoint({
                        x:points[index].x(),
                        y:points[index].y(),
                    }),
                    PolyPoint({
                        x:minDistancePoint[j].x(),
                        y:minDistancePoint[j].y(),
                    })
                ]
                );
                var myPath = new paper.Path({
                    segments: [[points[index].x(), points[index].y()], [minDistancePoint[j].x(), minDistancePoint[j].y()]]
                });

                myPath.strokeColor = "#4169E1";

                myPath.strokeWidth = 2;
            }

        }
    }

    paper.view.draw();
}

function highlightIiEdges(){
    var concavePoints = polygon.concavePoints();
    var points = polygon.points;
    var pointsLen = points.length;
    var orientation = polygon.orientation();

    resetPointColor(points);

    for (var i = 0; i < concavePoints.length; i ++){

        var index = concavePoints[i];
        var edges = meshGen.getEdgesInIi(polygon, index);

        for (var edgeIndex = 0; edgeIndex < edges.all.length; edgeIndex ++){
            var edge = edges.all[edgeIndex];
            var lineColor;
            if (contains(edges.partialIntersectionE1, edge)){
                //Line 1 intersects
                lineColor = '#ff0000'
            }
            else if (contains(edges.partialIntersectionE2, edge)){
                //Line 2 intersects
                lineColor = '#00FA9A';
            }
            else if (contains(edges.doubleIntersection, edge)){
                //Both lines intersect
                lineColor = '#FFFF00';
            }
            else if (contains(edges.contained, edge)){
                //Fully contained
                lineColor = '#9400D3';
            }

            var myPath = new paper.Path({
                segments: [[edge[0].x(), edge[0].y()], [edge[1].x(), edge[1].y()]]
            });

            myPath.strokeColor = lineColor;

            myPath.strokeWidth = 3;
        }

    }
    paper.view.draw();
}


var MeshGenerator = function(){

    var EDGE_CONTAINED = "CONTAINED";
    var EDGE_DOUBLE_INTERSECTION = "DOUBLE_INTERSECTION";
    var EDGE_PARTIAL_INTERSECTION_L1 = "PARTIAL_INTERSECTION_L1";
    var EDGE_PARTIAL_INTERSECTION_L2 = "PARTIAL_INTERSECTION_L2";

    function pointRelativeToLine(lineStart, lineEnd, point){
        //Returns > 0 for left of line and < 0 for right of line
        return ((lineEnd.x() - lineStart.x())*(point.y() - lineStart.y()) -
                (lineEnd.y() - lineStart.y())*(point.x() - lineStart.x()));
    }

    function getPointsInIi(polygon, iIndex){
        var points = polygon.points;
        var pointsLen = points.length;
        var orientation = polygon.orientation();

        var pointsInIIndex = []
        var index = iIndex;
        var line1 = [
            points[(pointsLen+index-1)%pointsLen],
            points[index],
        ];
        var line2 = [
            points[index],
            points[(index+1)%pointsLen],
        ];
        for (j = 0; j < pointsLen; j ++){
            var diff = iIndex - j;
            if (diff >= -1 && diff <= 1){
                continue;
            }
            if(isPointBetweenSegments(line1, line2, points[j], orientation)){
                pointsInIIndex.push(points[j]);
            }
        }
        return pointsInIIndex;
    }

    function isPointBetweenSegments(line1, line2, point, orientation){
        var relativeToLine1 = pointRelativeToLine(line1[0], line1[1], point) * orientation;
        if (relativeToLine1 < 0){
            var relativeToLine2 = pointRelativeToLine(line2[0], line2[1], point) * orientation;
            if (relativeToLine2 < 0){
                return true;
            }
        }
        return false;
    }

    function getIntersectionPoint(line1, line2){

        //https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line

        var x1 = line1[0].x();
        var y1 = line1[0].y();
        var x2 = line1[1].x();
        var y2 = line1[1].y();
        var x3 = line2[0].x();
        var y3 = line2[0].y();
        var x4 = line2[1].x();
        var y4 = line2[1].y();

        var denominator = (x1 - x2) * (y3 - y4) - (y1 - y2)*(x3 - x4);

        if (denominator == 0){
            //Lines are parallel
            return -1;
        }

        var xNumerator = (x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4);
        var yNumerator = (x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4);

        var x = xNumerator/denominator;
        var y = yNumerator/denominator;

        return PolyPoint({x:x, y:y}, null);
    }

    function getEdgesInIi(polygon, iIndex){
        var concavePoints = polygon.concavePoints();
        var points = polygon.points;
        var pointsLen = points.length;
        var orientation = polygon.orientation();

        var index = iIndex;
        var line1 = [
            points[(pointsLen+index-1)%pointsLen],
            points[index],
        ];
        var line2 = [
            points[index],
            points[(index+1)%pointsLen],
        ];

        var edges = {
            contained: [],
            partialIntersectionE1: [],
            partialIntersectionE2: [],
            doubleIntersection: [],
            all: []
        };

        for (j = 0; j < pointsLen; j ++){

            var diff = iIndex - j;
            if (diff > -1 && diff <= 1){
                continue;
            }

            var betweenResult = isEdgeBetweenSegments(line1, line2, [points[j], points[(j+1)%pointsLen]], orientation);
            var isLineBetween = betweenResult.isBetween;

            var list = null;
            if (isLineBetween){
                if (betweenResult.intersectionType == EDGE_PARTIAL_INTERSECTION_L1){
                    //Line 1 intersects
                    list = edges.partialIntersectionE1;
                }
                else if (betweenResult.intersectionType == EDGE_PARTIAL_INTERSECTION_L2){
                    //Line 2 intersects
                    list = edges.partialIntersectionE2;
                }
                else if (betweenResult.intersectionType == EDGE_DOUBLE_INTERSECTION){
                    //Both lines intersect
                    list = edges.doubleIntersection;
                }
                else if (betweenResult.intersectionType == EDGE_CONTAINED){
                    //Fully contained
                    list = edges.contained;
                }
            }

            if (isLineBetween){
                list.push([points[j], points[(j+1)%pointsLen]]);
                edges.all.push(list[list.length - 1]);//Push the same object for comparison reasons
            }
        }
        return edges;
    }

    function isEdgeBetweenSegments(line1, line2, edge, orientation){
        var isPoint1BetweenSegments = isPointBetweenSegments(line1, line2, edge[0], orientation);
        var isPoint2BetweenSegments = isPointBetweenSegments(line1, line2, edge[1], orientation);

        var intersection_type = null;

        var isBetween = false;

        if (isPoint1BetweenSegments || isPoint2BetweenSegments){
            isBetween = true;
            if (isPoint1BetweenSegments && isPoint2BetweenSegments){
                intersection_type = EDGE_CONTAINED;
            }
            else{
                var point1RelativityLine1 = pointRelativeToLine(line1[0], line1[1], edge[0]) * orientation;
                var point2RelativityLine1 = pointRelativeToLine(line1[0], line1[1], edge[1]) * orientation;

                var line1Intersect = point1RelativityLine1 * point2RelativityLine1 < 0;
                var line1Left = point1RelativityLine1 < 0 && point2RelativityLine1 < 0;

                var point1RelativityLine2 = pointRelativeToLine(line2[0], line2[1], edge[0]) * orientation;
                var point2RelativityLine2 = pointRelativeToLine(line2[0], line2[1], edge[1]) * orientation;

                var line2Intersect = point1RelativityLine2 * point2RelativityLine2 < 0;
                var line2Left = point1RelativityLine2 < 0 && point2RelativityLine2 < 0;

                if (line1Intersect){
                    //Line 1 intersects
                    intersection_type = EDGE_PARTIAL_INTERSECTION_L1;
                }
                else if (line2Intersect){
                    //Line 2 intersects
                    intersection_type = EDGE_PARTIAL_INTERSECTION_L2;
                }
            }
        }
        else {
            //Use three prong attack
            //   /      <-line1
            //   --     <-This is new_line see below
            //   \      <-line2

            var line1Mag = Math.sqrt(Math.pow((line1[1].x() - line1[0].x()),2) + Math.pow(line1[1].y() - line1[0].y(),2));
            var line2Mag = Math.sqrt(Math.pow((line2[1].x() - line2[0].x()),2) + Math.pow(line2[1].y() - line2[0].y(),2));

            //100* is for drawing purposes when debugging

            var line1DX = 100*(line1[1].x() - line1[0].x())/line1Mag;
            var line2DX = 100*(line2[0].x() - line2[1].x())/line2Mag;

            var line1DY = 100*(line1[1].y() - line1[0].y())/line1Mag;
            var line2DY = 100*(line2[0].y() - line2[1].y())/line2Mag;

            var new_line = [
                            PolyPoint({
                                x: line1[1].x(),
                                y: line1[1].y()
                            }),
                            PolyPoint({
                                x: line1[1].x() + line1DX + line2DX,
                                y: line1[1].y() + line1DY + line2DY
                            }),
                        ];

            var intersection  = getIntersectionPoint(new_line, edge);

            if (intersection != -1){
                var isInSector = isPointBetweenSegments(line1,line2, intersection, orientation);
                if (isInSector){
                    var p1RelativityMiddleLine = pointRelativeToLine(new_line[0], new_line[1], edge[0]);
                    var p2RelativityMiddleLine = pointRelativeToLine(new_line[0], new_line[1], edge[1]);
                    //Must be on opposite ends of the line
                    if (p1RelativityMiddleLine * p2RelativityMiddleLine < 0){
                        isBetween = true;
                        intersection_type = EDGE_DOUBLE_INTERSECTION;
                    }
                }
            }

        }

        return {isBetween: isBetween, intersectionType: intersection_type};
    }

    function projectPointToLineSegment(A, B, p){
        //from http://www.alecjacobson.com/weblog/?p=1486
        var AB = PolyPoint({
            x: B.x() - A.x(),
            y: B.y() - A.y()
        }, null);
        // squared distance from A to B
        var AB_squared = A.distance2(B);
        if(AB_squared == 0){
            // A and B are the same point
            return A;
        }
        else{
            // vector from A to p
            var Ap = PolyPoint({
                x: p.x() - A.x(),
                y: p.y() - A.y()
            }, null);
            // from http://stackoverflow.com/questions/849211/
            // Consider the line extending the segment, parameterized as A + t (B - A)
            // We find projection of point p onto the line.
            // It falls where t = [(p-A) . (B-A)] / |B-A|^2
            var t = (Ap.x()*AB.x() + Ap.y()*AB.y())/AB_squared;
            if (t < 0.0){
                // "Before" A on the line, just return A
                return A;
            }
            else if (t > 1.0){
                // "After" B on the line, just return B
                return B;
            }
            else{
                // projection lines "inbetween" A and B on the line
                q = A + t * AB;
                var newPoint = PolyPoint({
                    x: A.x() + t*AB.x(),
                    y: A.y() + t*AB.y()
                }, null);
                return newPoint;
            }
        }
    }

    return {
        pointRelativeToLine: pointRelativeToLine,
        getPointsInIi: getPointsInIi,
        getEdgesInIi: getEdgesInIi,
        projectPointToLineSegment: projectPointToLineSegment,
        isPointBetweenSegments: isPointBetweenSegments,
        isEdgeBetweenSegments: isEdgeBetweenSegments,
        getIntersectionPoint: getIntersectionPoint,
        EDGE_DOUBLE_INTERSECTION: EDGE_DOUBLE_INTERSECTION,
        EDGE_CONTAINED: EDGE_CONTAINED,
        EDGE_PARTIAL_INTERSECTION_L1: EDGE_PARTIAL_INTERSECTION_L1,
        EDGE_PARTIAL_INTERSECTION_L2: EDGE_PARTIAL_INTERSECTION_L2
    };
}


var Poly = function (paper){
    var points = [];
    var path = new paper.Path();
    var orientation = 1;

    function _init(){
        path.strokeColor = 'black';
        path.closed = true;
    }

    function addPoint(newPoint){
        points.push(newPoint);
        path.add(new paper.Point(newPoint.x(), newPoint.y()));
        orientation = getPointsOrientation(points);
        orientation = orientation/Math.abs(orientation);
        newPoint.draw();
    }

    function concavePoints(){
        var concavePoints = [];
        var pointsLen = points.length;
        var lookAhead = 3;
        for (var i = 0; i < pointsLen; i ++){
            var pointsList = [];
            for (var j = i; j < i + lookAhead; j ++){
                pointsList.push(points[j%pointsLen]);
            }
            var concaveMeasure = orientation * getPointsOrientation(pointsList);
            if (concaveMeasure < 0){
                concavePoints.push((i + 1)%pointsLen);
            }
        }
        return concavePoints;
    }

    /*
    Calculates twice the area, if -ve, then clockwise, if +ve, then counter-clockwise
    */
    function getPointsOrientation(pointList){
        var sum = 0;
        var len = pointList.length;
        for (var i = 0; i < len; i ++){
            sum += (pointList[(i+1)%len].x() - pointList[i].x()) * (pointList[(i+1)%len].y() + pointList[i].y())
        }

        return sum;
    }

    function getOrientation(){
        return orientation;
    }

    _init();

    return {
        points: points,
        addPoint: addPoint,
        concavePoints: concavePoints,
        orientation: getOrientation
    };

}

var PolyPoint = function (config, paper){
    var _x = 0;
    var _y = 0;
    var _color = 'black';
    var _size = 5;
    var _paper = paper;
    var _gfx = null;

    function _init(config){
        _x = config.x;
        _y = config.y;
    }

    function x(){
        return _x;
    }

    function y(){
        return _y;
    }

    function distance2(other){
        return Math.pow(_x - other.x(),2) + Math.pow(_y - other.y(),2)
    }

    function setColor(newColor){
        _color = newColor;
    }

    function draw(){
        if (_gfx !== null){
            _gfx.remove();
        }
        _gfx = new paper.Path.Circle(new paper.Point(_x, _y), _size);
        _gfx.fillColor = _color;
    }

    _init(config);

    return {
        x: x,
        y: y,
        distance2: distance2,
        setColor: setColor,
        draw: draw
    };
}
