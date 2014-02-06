// Copyright 2002-2013, University of Colorado Boulder

/**
 * Scenery node for the track, which can be translated by dragging the track, or manipulated by dragging its control points.
 * If the track's length is changed (by deleting a control point or linking two tracks together) a new TrackNode is created.
 * Keep track of whether the track is dragging, so performance can be optimized while dragging
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Shape = require( 'KITE/Shape' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var SplineEvaluation = require( 'ENERGY_SKATE_PARK_BASICS/model/SplineEvaluation' );
  var Vector2 = require( 'DOT/Vector2' );
  var Image = require( 'SCENERY/nodes/Image' );
  var RectanglePushButton = require( 'SUN/RectanglePushButton' );
  var scissorsImage = require( 'image!ENERGY_SKATE_PARK_BASICS/scissors.png' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var RoundShinyButton = require( 'SCENERY_PHET/RoundShinyButton' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   * Constructor for TrackNode
   * @param model the entire model
   * @param track the track for this track node
   * @param modelViewTransform the model view transform for the view
   * @param panelContainsPoint optional function for determining whether the user tried to put a track back in the control panel.
   * @constructor
   */
  function TrackNode( model, track, modelViewTransform, panelContainsPoint ) {
    var trackNode = this;
    Node.call( this );
    var road = new Path( null, {fill: 'gray', cursor: track.interactive ? 'pointer' : 'default'} );
    var dashedLine = new Path( null, {stroke: '#EBC138', lineWidth: '2', lineDash: [7, 4]} );
    model.stickToTrackProperty.link( function( stickToTrack ) { dashedLine.visible = stickToTrack; } );

    track.readyToReturnProperty.link( function( readyToReturn ) { road.fill = readyToReturn ? 'yellow' : 'gray'; } );
    this.addChild( road );
    this.addChild( dashedLine );

    if ( track.interactive ) {
      var lastDragPoint;
      var handler = new SimpleDragHandler( {
          allowTouchSnag: true,

          start: function( event ) {
            lastDragPoint = event.pointer.point;
            track.dragging = true;
          },

          //Drag an entire track
          drag: function( event ) {
            track.dragging = true;
            var dragPoint = event.pointer.point;
            var delta = handler.transform.inverseDelta2( dragPoint.minus( lastDragPoint ) );
            lastDragPoint = dragPoint;

            //Is the user trying to return the track?
            track.overTrackPanel = panelContainsPoint( dragPoint );

            var modelDelta = modelViewTransform.viewToModelDelta( delta );

            //When dragging track, make sure the control points don't go below ground, see #71
            var bottomControlPointY = track.getBottomControlPointY();
            var translatedBottomControlPointY = bottomControlPointY + modelDelta.y;

            //If the user moved it out of the toolbox above y=0, then make it physically interactive
            if ( !track.physical && track.getBottomControlPointY() > 0 ) {
              track.physical = true;
            }

            if ( track.physical ) {
              if ( translatedBottomControlPointY < 0 ) {
                modelDelta.y += Math.abs( translatedBottomControlPointY );
              }
            }

            track.translate( modelDelta.x, modelDelta.y );

            //If one of the control points is close enough to link to another track, do so
            var tracks = model.getPhysicalTracks();

            var bestDistance = null;
            var myBestPoint = null;
            var otherBestPoint = null;

            var myPoints = [track.controlPoints[0], track.controlPoints[track.controlPoints.length - 1]];

            for ( var i = 0; i < tracks.length; i++ ) {
              var t = tracks[i];
              if ( t !== track ) {

//              console.log( "comparing this = ", track.toString(), 'to', t.toString() );

                //4 cases 00, 01, 10, 11
                var otherPoints = [t.controlPoints[0], t.controlPoints[t.controlPoints.length - 1]];

                //don't match inner points

                for ( var j = 0; j < myPoints.length; j++ ) {
                  var myPoint = myPoints[j];
                  for ( var k = 0; k < otherPoints.length; k++ ) {
                    var otherPoint = otherPoints[k];
//                  debugger;
                    var distance = myPoint.sourcePosition.distance( otherPoint.position );
//                  console.log( distance );
                    if ( (bestDistance === null && distance > 1E-6) || (distance < bestDistance ) ) {
                      bestDistance = distance;
                      myBestPoint = myPoint;
                      otherBestPoint = otherPoint;
                    }
                  }
                }
              }
            }


            if ( bestDistance !== null && bestDistance < 1 ) {
//              console.log( 'setting best to ', otherBestPoint.position.x, otherBestPoint.position.x, 'bestDistance', bestDistance );
              myBestPoint.snapTarget = otherBestPoint;

              //Set the opposite point to be unsnapped, you can only snap one at a time
              (myBestPoint === myPoints[0] ? myPoints[1] : myPoints[0]).snapTarget = null;
            }
            else {
              myPoints[0].snapTarget = null;
              myPoints[1].snapTarget = null;
            }
          },

          //End the drag
          end: function() {
            var myPoints = [track.controlPoints[0], track.controlPoints[track.controlPoints.length - 1]];
            if ( myPoints[0].snapTarget || myPoints[1].snapTarget ) {
              model.joinTracks( track );
            }

            //Return the track.  If it was a combination of two tracks, split them and return both, or keep track of parents, or something
            //When dropping the track in the toolbox, make nonphysical and reset coordinates
            else if ( track.readyToReturn ) {
              track.returnToControlPanel();
            }
            track.bumpAboveGround();
            track.dragging = false;
          }
        }
      );

      road.addInputListener( handler );
    }

    //Reuse arrays to save allocations and prevent garbage collections, see #38
    var x = new Array( track.controlPoints.length );
    var y = new Array( track.controlPoints.length );

    //Store for performance
    var lastPt = (track.controlPoints.length - 1) / track.controlPoints.length;

    //Sample space, which is recomputed if the track gets longer, to keep it looking smooth no matter how many control points
    var linSpace = numeric.linspace( 0, lastPt, 20 * (track.controlPoints.length - 1) );
    var lengthForLinSpace = track.controlPoints.length;

    var updateTrackShape = function() {

      var i;
      //Update the sample range when the number of control points has changed
      if ( lengthForLinSpace !== track.controlPoints.length ) {
        lastPt = (track.controlPoints.length - 1) / track.controlPoints.length;
        linSpace = numeric.linspace( 0, lastPt, 20 * (track.controlPoints.length - 1) );
        lengthForLinSpace = track.controlPoints.length;
      }

      //Arrays are fixed length, so just overwrite values
      for ( i = 0; i < track.controlPoints.length; i++ ) {
        x[i] = track.controlPoints[i].position.x;
        y[i] = track.controlPoints[i].position.y;
      }

      //Compute points for lineTo
      var xPoints = SplineEvaluation.at( track.xSpline, linSpace );
      var yPoints = SplineEvaluation.at( track.ySpline, linSpace );

      var tx = trackNode.getTranslation();
      var shape = new Shape().moveTo( modelViewTransform.modelToViewX( xPoints[0] ) - tx.x, modelViewTransform.modelToViewY( yPoints[0] ) - tx.y );

      //Show the track at reduced resolution while dragging so it will be smooth and responsive while dragging (whether updating the entire track, some of the control points or both)
      var delta = track.dragging ? 3 : 1;
      for ( i = 1; i < xPoints.length; i = i + delta ) {
        shape.lineTo( modelViewTransform.modelToViewX( xPoints[i] ) - tx.x, modelViewTransform.modelToViewY( yPoints[i] ) - tx.y );
      }

      //If at reduced resolution, still make sure we draw to the end point
      if ( i !== xPoints.length - 1 ) {
        i = xPoints.length - 1;
        shape.lineTo( modelViewTransform.modelToViewX( xPoints[i] ) - tx.x, modelViewTransform.modelToViewY( yPoints[i] ) - tx.y );
      }

      var strokeStyles = new LineStyles( {
        lineWidth: 10,
        lineCap: 'butt',
        lineJoin: 'miter',
        miterLimit: 10
      } );
      road.shape = shape.getStrokedShape( strokeStyles );
      dashedLine.shape = shape;

      //Update the skater if the track is moved while the sim is paused, see https://github.com/phetsims/energy-skate-park-basics/issues/84
      if ( model.skater.track === track && model.paused ) {
        model.skater.position = track.getPoint( model.skater.u );
        model.skater.angle = model.skater.track.getViewAngleAt( model.skater.u ) + (model.skater.up ? 0 : Math.PI);
        model.skater.trigger( 'updated' );
      }
    };

    if ( track.interactive ) {
      for ( var i = 0; i < track.controlPoints.length; i++ ) {
        (function( i, isEndPoint ) {
          var controlPoint = track.controlPoints[i];
          var controlPointNode = new Circle( 14, {pickable: false, opacity: 0.7, stroke: 'black', lineWidth: 2, fill: 'red', cursor: 'pointer', translation: modelViewTransform.modelToViewPosition( controlPoint.position )} );

          //Show a dotted line for the exterior track points, which can be connected to other track
          if ( i === 0 || i === track.controlPoints.length - 1 ) {
            controlPointNode.lineDash = [ 4, 5 ];
          }

          //Make it so you can only translate the track to bring it out of the toolbox, but once it is out of the toolbox it can be reshaped
          track.physicalProperty.link( function( physical ) { controlPointNode.pickable = physical; } );

          controlPoint.positionProperty.link( function( position ) {
            controlPointNode.translation = modelViewTransform.modelToViewPosition( position );
          } );
          controlPointNode.addInputListener( new SimpleDragHandler(
            {
              allowTouchSnag: true,
              start: function() {
                track.dragging = true;
              },
              drag: function( event ) {
                track.dragging = true;
                var globalPoint = controlPointNode.globalToParentPoint( event.pointer.point );

                //trigger reconstruction of the track shape based on the control points
                var pt = modelViewTransform.viewToModelPosition( globalPoint );

                //Constrain the control points to remain in y>0, see #71
                pt.y = Math.max( pt.y, 0 );
                controlPoint.sourcePosition = pt;

                if ( isEndPoint ) {
                  //If one of the control points is close enough to link to another track, do so
                  var tracks = model.getPhysicalTracks();

                  var bestDistance = Number.POSITIVE_INFINITY;
                  var bestMatch = null;

                  for ( var i = 0; i < tracks.length; i++ ) {
                    var t = tracks[i];
                    if ( t !== track ) {

                      //don't match inner points
                      var otherPoints = [t.controlPoints[0], t.controlPoints[t.controlPoints.length - 1]];

                      for ( var k = 0; k < otherPoints.length; k++ ) {
                        var otherPoint = otherPoints[k];
                        var distance = controlPoint.sourcePosition.distance( otherPoint.position );

                        if ( distance < bestDistance ) {
                          bestDistance = distance;
                          bestMatch = otherPoint;
                        }
                      }
                    }
                  }

                  controlPoint.snapTarget = bestDistance !== null && bestDistance < 1 ? bestMatch : null;
                }

                //When one control point dragged, update the track and the node shape
                track.updateSplines();
                updateTrackShape();
              },
              end: function() {
                if ( isEndPoint && controlPoint.snapTarget ) {
                  model.joinTracks( track );
                }
                track.bumpAboveGround();
                track.dragging = false;

                //Show the 'control point editing' ui
                var alpha = new LinearFunction( 0, track.controlPoints.length - 1, track.minPoint, track.maxPoint )( i ); //a1, a2, b1, b2, clamp
                var angle = track.getViewAngleAt( alpha );
                var modelAngle = track.getModelAngleAt( alpha );

                if ( !isEndPoint ) {
                  var scissorNode = new FontAwesomeNode( 'cut', {fill: 'black', scale: 0.6, rotation: Math.PI / 2 - angle} );
                  var cutButton = new RoundShinyButton( function() { model.splitControlPoint( track, i, modelAngle ); }, scissorNode, {
                    center: controlPointNode.center.plus( Vector2.createPolar( 40, angle + Math.PI / 2 ) ),
                    radius: 20,
                    touchAreaRadius: 20 * 1.3,

                    //yellow color scheme
                    upFill: new Color( '#fefd53' ),
                    overFill: new Color( '#fffe08' ),
                    downFill: new Color( '#e9e824' )
                  } );
//                var cutButton = new RectanglePushButton( scissorNode, {center: controlPointNode.center.plus( Vector2.createPolar( 40, angle + Math.PI / 2 ) )} );
//                var disableDismissAction = { down: function() { enableClickToDismissListener = false; } };
//                cutButton.addInputListener( disableDismissAction );
                  cutButton.addListener( function() { model.splitControlPoint( track, i, modelAngle ); } );
                  trackNode.addChild( cutButton );
                }

                //TODO: If it is down to 2 points, just delete the entire track.
                var deleteNode = new FontAwesomeNode( 'times_circle', {fill: 'red', scale: 0.6} );
                var deleteButton = new RoundShinyButton( function() { model.deleteControlPoint( track, i ); }, deleteNode, {
                  center: controlPointNode.center.plus( Vector2.createPolar( 40, angle - Math.PI / 2 ) ),
                  radius: 20,
                  touchAreaRadius: 20 * 1.3,

                  //yellow color scheme
                  upFill: new Color( '#fefd53' ),
                  overFill: new Color( '#fffe08' ),
                  downFill: new Color( '#e9e824' )} );
//                deleteButton.addInputListener( disableDismissAction );
                trackNode.addChild( deleteButton );
              }
            } ) );
          trackNode.addChild( controlPointNode );
        })( i, i === 0 || i === track.controlPoints.length - 1 );
      }
    }

    //Init the track shape
    updateTrackShape();

    //Update the track shape when the whole track is translated
    //Just observing the control points individually would lead to N expensive callbacks (instead of 1) for each of the N points
    //So we use this broadcast mechanism instead
    track.on( 'translated', updateTrackShape );

    track.draggingProperty.link( function( dragging ) {
      if ( !dragging ) {
        updateTrackShape();
      }
    } );

    track.on( 'reset', updateTrackShape );
  }

  return inherit( Node, TrackNode );
} );