// Copyright 2018-2020, University of Colorado Boulder

/**
 * A collection of tracks used in the EnergySkateParkTrackSet models of energy-skate-park and energy-skate-park-basics.
 * Premade tracks are not draggable but they can sometimes be "configurable", meaning that control points can be moved.
 * For configurable premade tracks, the control points can only be dragged within a smaller set of bounds. These
 * bounds are specified for all premade tracks, but will only apply to the track if the model tracks are "configurable".
 *
 * Premade tracks are all isolated so they have no "parent" tracks, see Track.js for definition of parent.
 *
 * @author Jesse Greenberg
 */

define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const ControlPoint = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/model/ControlPoint' );
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const merge = require( 'PHET_CORE/merge' );
  const Track = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/model/Track' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const PARENT_TRACKS = null;

  // limiting bounds for dragging control points
  const END_BOUNDS_WIDTH = 3;
  const END_BOUNDS_HEIGHT = 4;

  const CREATOR_OPTIONS = {

    // {boolean} - premade tracks can have draggable control points, and setting this to true will limit
    // the drag bounds of control points for each track. Each control point can have unique bounds so limiting
    // bounds are created in each creator function
    limitPointBounds: false
  };

  /**
   * Create a set of limiting drag bounds for a control point of a premade track. The control point is at the
   * CENTER of the limiting bounds.
   *
   * @param  {Vector2} point - location of control point, CENTER of the bounds
   * @param  {number} width
   * @param  {number} height
   * @returns {Bounds2}
   */
  const createCenteredLimitBounds = ( point, width, height ) => {
    return new Bounds2( point.x - width / 2, point.y - height / 2, point.x + width / 2, point.y + height / 2 );
  };

  /**
   * Create a set of limiting drag bounds for a control point of a premade track. The control point is at the BOTTOM
   * CENTER of the limiting bounds.
   *
   * @param  {Vector2} point - location of control point, BOTTOM CENTER of the bounds
   * @param  {number} width
   * @param  {number} height
   * @returns {Bounds2}
   */
  const createBottomLimitBounds = ( point, width, height ) => {
    return new Bounds2( point.x - width / 2, point.y, point.x + width / 2, point.y + height );
  };

  /**
   * Create a set of limiting drag bounds for a control point. The spacing args are relative to provided point,
   * which is presumably the location of the control point.
   *
   * @param {Vector2} point - spacing in each direction relative to this point
   * @param {number} leftSpace - space to the left of point for bounds
   * @param {number} rightSpace - space to the right of point for bounds
   * @param {number} upSpace - space to the up of point for bounds
   * @param {number} downSpace - space to the down of point for bounds
   * @returns {Bounds2}
   */
  const createRelativeSpaceBounds = ( point, leftSpace, rightSpace, upSpace, downSpace ) => {
    return new Bounds2( point.x - leftSpace, point.y - downSpace, point.x + rightSpace, point.y + upSpace );
  };

  const PremadeTracks = {

    /**
     * Create a set of control points that create a parabola shaped track.
     * @param {Tandem} groupTandem
     * @param {Object} [options]
     * @returns {ControlPoint[]}
     */
    createParabolaControlPoints: ( groupTandem, options ) => {
      options = merge( {
        trackHeight: 6, // largest height for the parabola
        trackWidth: 8, // width from the left most control point to the right most control point

        // {boolean} - individual points may or may not be draggable
        p1Draggable: true,
        p2Draggable: true,
        p3Draggable: true
      },CREATOR_OPTIONS, options );

      const p1 = new Vector2( -options.trackWidth / 2, options.trackHeight );
      const p2 = new Vector2( 0, 0 );
      const p3 = new Vector2( options.trackWidth / 2, options.trackHeight );

      const p1Bounds = createCenteredLimitBounds( p1, END_BOUNDS_WIDTH, END_BOUNDS_HEIGHT );
      const p2Bounds = createBottomLimitBounds( p2, 5, 3 );
      const p3Bounds = createCenteredLimitBounds( p3, END_BOUNDS_WIDTH, END_BOUNDS_HEIGHT );

      return [
        new ControlPoint( p1.x, p1.y, {
          draggable: options.p1Draggable,
          limitBounds: p1Bounds,
          tandem: groupTandem.createNextTandem(),
          phetioState: false
        } ),
        new ControlPoint( p2.x, p2.y, {
          draggable: options.p2Draggable,
          limitBounds: p2Bounds,
          tandem: groupTandem.createNextTandem(),
          phetioState: false
        } ),
        new ControlPoint( p3.x, p3.y, {
          draggable: options.p3Draggable,
          limitBounds: p3Bounds,
          tandem: groupTandem.createNextTandem(),
          phetioState: false
        } )
      ];
    },

    /**
     * Create a set of control points which create a slope shaped track, touching the ground on the right side.
     *
     * @param {Tandem} groupTandem
     * @param {Object} options
     * @returns {ControlPoint[]}
     */
    createSlopeControlPoints: ( groupTandem, options ) => {
      options = merge( CREATOR_OPTIONS, options );

      const p1 = new Vector2( -4, 6 );
      const p2 = new Vector2( -2, 1.2 );
      const p3 = new Vector2( 2, 0 );

      const p1Bounds = createCenteredLimitBounds( p1, END_BOUNDS_WIDTH, END_BOUNDS_HEIGHT );

      // custom relative bounds so that bounds fall along the meter
      const p2Bounds = createRelativeSpaceBounds( p2, 0.5, 2.5, 1.8, 0.2 );
      const p3Bounds = createRelativeSpaceBounds( p3, 0.5, 2.5, 3, 0 );

      return [
        new ControlPoint( p1.x, p1.y, { limitBounds: p1Bounds, tandem: groupTandem.createNextTandem(), phetioState: false } ),
        new ControlPoint( p2.x, p2.y, { limitBounds: p2Bounds, tandem: groupTandem.createNextTandem(), phetioState: false } ),
        new ControlPoint( p3.x, p3.y, { limitBounds: p3Bounds, tandem: groupTandem.createNextTandem(), phetioState: false } )
      ];
    },

    /**
     * Create a set of control points that will create a double well track. For the double well, move the left well up
     * a but since the interpolation moves it down by that much and we don't want the skater to go below ground
     * while on the track. Numbers determined by trial and error.
     *
     * @param {Tandem} groupTandem
     * @param {Object} options
     * @returns {ControlPoint[]}
     */
    createDoubleWellControlPoints: ( groupTandem, options ) => {
      options = merge( {
        trackHeight: 5, // largest height for the well
        trackWidth: 8, // width from the left most control point to the right most control point
        trackMidHeight: 2, // height of the mid control point that creates the double well

        // {boolean} - individual points may or may not be draggable
        p1Draggable: true,
        p2Draggable: true,
        p3Draggable: true,
        p4Draggable: true,
        p5Draggable: true,

        // Spacing for drag bounds of the third (center) control point for createRelativeSpaceBounds
        p3UpSpacing: 4,
        p3DownSpacing: 2
      }, CREATOR_OPTIONS, options );

      const p1 = new Vector2( -options.trackWidth / 2, options.trackHeight );
      const p2 = new Vector2( -2, 0.0166015 );
      const p3 = new Vector2( 0, options.trackMidHeight );
      const p4 = new Vector2( 2, 1 );
      const p5 = new Vector2( options.trackWidth / 2, options.trackHeight );

      const p1Bounds = createRelativeSpaceBounds( p1, 1.5, 1.5, 3, 1 );
      const p2Bounds = createRelativeSpaceBounds( p2, 1.5, 0.5, 3, 0 );
      const p3Bounds = createRelativeSpaceBounds( p3, 1, 1, options.p3UpSpacing, options.p3DownSpacing );
      const p4Bounds = createRelativeSpaceBounds( p4, 0.5, 1.5, 2, 1 );
      const p5Bounds = createRelativeSpaceBounds( p5, 1.5, 1.5, 3, 1 );

      return [
        new ControlPoint( p1.x, p1.y, {
          limitBounds: p1Bounds,
          draggable: options.p1Draggable,
          phetioState: false,
          tandem: groupTandem.createNextTandem()
        } ),
        new ControlPoint( p2.x, p2.y, {
          limitBounds: p2Bounds,
          draggable: options.p2Draggable,
          phetioState: false,
          tandem: groupTandem.createNextTandem()
        } ),
        new ControlPoint( p3.x, p3.y, {
          limitBounds: p3Bounds,
          draggable: options.p3Draggable,
          phetioState: false,
          tandem: groupTandem.createNextTandem()
        } ),
        new ControlPoint( p4.x, p4.y, {
          limitBounds: p4Bounds,
          draggable: options.p4Draggable,
          phetioState: false,
          tandem: groupTandem.createNextTandem()
        } ),
        new ControlPoint( p5.x, p5.y, {
          limitBounds: p5Bounds,
          draggable: options.p5Draggable,
          phetioState: false,
          tandem: groupTandem.createNextTandem()
        } )
      ];
    },

    /**
     * Create a set of control points that will form a track that takes the shape of a loop.
     *
     * @param  {Tandem} groupTandem
     * @returns {Array.<ControlPoint>}
     */
    createLoopControlPoints: ( groupTandem, options ) => {
      options = merge( CREATOR_OPTIONS, options );

      // top of the left and right endpoints of the loop, higher than loopTop so that it is easy for the skater to go
      // all the way around the loop
      const trackTop = 6;

      const trackBottom = 0.3; // bottom points, so that the skater doesn't go below y = 0
      const loopTop = 4; // adjust to make the loop top point higher or lower
      const loopWidth = 9; // adjust to make the loop more or less wide
      const innerLoopWidth = 3; // roughly adjusts the width of the innerloop
      const innerLoopHeight = 2; // roughly adjust inner loop height (for control points, actual loop will be higher)

      const p1 = new Vector2( -loopWidth / 2, trackTop );
      const p2 = new Vector2( -innerLoopWidth / 2, trackBottom );
      const p3 = new Vector2( innerLoopWidth/ 2, innerLoopHeight );
      const p4 = new Vector2( 0, loopTop );
      const p5 = new Vector2( -innerLoopWidth / 2, innerLoopHeight );
      const p6 = new Vector2( innerLoopWidth / 2, trackBottom );
      const p7 = new Vector2( loopWidth / 2, trackTop );

      const p1Bounds = createRelativeSpaceBounds( p1, 1, 1, 2, 3 );
      const p2Bounds = createRelativeSpaceBounds( p2, 1, 1, 1 - trackBottom, trackBottom );
      const p3Bounds = createCenteredLimitBounds( p3, 2, 1 );
      const p4Bounds = createRelativeSpaceBounds( p4, 1.5, 1.5, 2, 1 );
      const p5Bounds = createCenteredLimitBounds( p5, 2, 1 );
      const p6Bounds = createRelativeSpaceBounds( p6, 1, 1, 1 - trackBottom, trackBottom );
      const p7Bounds = createRelativeSpaceBounds( p7, 1, 1, 2, 3 );

      return [
        new ControlPoint( p1.x, p1.y, { limitBounds: p1Bounds, tandem: groupTandem.createNextTandem(), phetioState: false } ),
        new ControlPoint( p2.x, p2.y, {
          limitBounds: p2Bounds,
          tandem: groupTandem.createNextTandem(),
          phetioState: false
        } ),
        new ControlPoint( p3.x, p3.y, {
          limitBounds: p3Bounds,
          tandem: groupTandem.createNextTandem(),
          phetioState: false
        } ),
        new ControlPoint( p4.x, p4.y, { limitBounds: p4Bounds, tandem: groupTandem.createNextTandem(), phetioState: false } ),
        new ControlPoint( p5.x, p5.y, { limitBounds: p5Bounds,
          tandem: groupTandem.createNextTandem(),
          phetioState: false
        } ),
        new ControlPoint( p6.x, p6.y, { limitBounds: p6Bounds, tandem: groupTandem.createNextTandem(), phetioState: false } ),
        new ControlPoint( p7.x, p7.y, { limitBounds: p7Bounds, tandem: groupTandem.createNextTandem(), phetioState: false } )
      ];
    },

    /**
     * Create a track from the provided control points.
     *
     * @param  {EnergySkateParkModel} model
     * @param  {Array.<Track>} modelTracks
     * @param  {Array.<ControlPoint>} controlPoints
     * @param  {Property.<Bounds2>} availableBoundsProperty
     * @param  {object} options
     * @returns {Track}
     */
    createTrack( model, modelTracks, controlPoints, availableBoundsProperty, options ) {
      return new Track( model, modelTracks, controlPoints, PARENT_TRACKS, availableBoundsProperty, options );
    }
  };

  energySkatePark.register( 'PremadeTracks', PremadeTracks );

  return PremadeTracks;
} );
