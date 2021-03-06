// Copyright 2018-2019, University of Colorado Boulder

/**
 * A Checkbox in EnergySkatePark, which includes a label and an icon. Icons are generally aligned with other checkboxes
 * in the group, and this is handled by collecting all icons into a shared AlignGroup.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const Checkbox = require( 'SUN/Checkbox' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const EnergySkateParkColorScheme = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/EnergySkateParkColorScheme' );
  const GaugeNode = require( 'SCENERY_PHET/GaugeNode' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  //
  // strings
  const propertiesSpeedString = require( 'string!ENERGY_SKATE_PARK/properties.speed' );

  /**
   * @constructor
   * @param {string} label
   * @param {Node} icon
   * @param {AlignGroup} textAlignGroup
   * @param {Property} property - the checkbox will update this Property
   * @param {Tandem} tandem
   * @param {Object} options
   */
  class EnergySkateParkCheckboxItem extends HBox {
    constructor( label, icon, textAlignGroup, property, tandem, options ) {

      assert && assert( textAlignGroup.matchHorizontal === true, 'text content in check boxes must align' );
      assert && assert( textAlignGroup.matchVertical === true, 'text content for checkboxes in group must align' );

      options = merge( {

        // {number} - default determined by inspection, certain contexts require shorter width
        labelMaxWidth: 95
      }, options );

      const textOptions = {
        font: new PhetFont( 10 ),
        maxWidth: options.labelMaxWidth
      };

      const checkboxItemOptions = {
        boxWidth: 14,
        tandem: tandem
      };

      // create text and an align box for it so that all text in a group of items is aligned
      const text = new Text( label, merge( { tandem: tandem.createTandem( 'itemLabel' ) }, textOptions ) );
      const textBox = textAlignGroup.createBox( text, { xAlign: 'left' } );

      const checkbox = new Checkbox( textBox, property, checkboxItemOptions );

      super( {
        children: [ checkbox, icon ],
        spacing: 10
      } );
    
    }

    /**
     * In icon for the pie chart..
     * @param {Tandem} tandem
     * @param {Object} options
     * @returns {Node}
     */
    static createPieChartIcon( tandem, options ) {
      options = merge( {
        scale: 1
      }, options );

      const radius = 10;
      const x = new Shape().moveTo( 0, 0 ).ellipticalArc( 0, 0, radius, radius, 0, -Math.PI / 2, 0, false ).lineTo( 0, 0 );
      return new Node( {
        tandem: tandem,
        children: [
          new Circle( radius, { fill: EnergySkateParkColorScheme.potentialEnergy, lineWidth: 0.5, stroke: 'black' } ),
          new Path( x, {
            tandem: tandem.createTandem( 'path' ), // TODO: What is this path for
            fill: EnergySkateParkColorScheme.kineticEnergy, lineWidth: 0.5, stroke: 'black'
          } )
        ],
        scale: options.scale
      } );
    }

    /**
     * An icon for the grid.
     * @param {Tandem} tandem
     * @param {Object} options
     * @returns {Node}
     */
    static createGridIcon( tandem, options ) {
      options = merge( {
        scale: 1
      }, options );
      return new Node( {
        tandem: tandem,
        children: [
          new Rectangle( 0, 0, 20, 20, { fill: 'white', stroke: 'black', lineWidth: 0.5 } ),
          new Line( 0, 10, 20, 10, { stroke: 'black', lineWidth: 1 } ),
          new Line( 0, 5, 20, 5, { stroke: 'black', lineWidth: 0.5 } ),
          new Line( 0, 15, 20, 15, { stroke: 'black', lineWidth: 0.5 } ),
          new Line( 10, 0, 10, 20, { stroke: 'black', lineWidth: 1 } ),
          new Line( 5, 0, 5, 20, { stroke: 'black', lineWidth: 0.5 } ),
          new Line( 15, 0, 15, 20, { stroke: 'black', lineWidth: 0.5 } )
        ],
        scale: options.scale
      } );
    }

    /**
     * An icon for the speedometer.
     * @param {Tandem} tandem
     * @param {Object} options
     * @returns {Node}
     */
    static createSpeedometerIcon( tandem, options ) {
      options = merge( {
        scale: 1
      }, options );
      const node = new GaugeNode( new Property( 0 ), propertiesSpeedString, new Range( 0, 10 ),
        {
          pickable: false,
          tandem: tandem.createTandem( 'gaugeNode' )
        } );
      node.scale( ( 20 / node.width ) * options.scale );
      return node;
    }

    /**
     * An icon for the reference height control.
     * @param {Tandem} tandem 
     * @returns {Node}
     */
    static createReferenceHeightIcon( tandem ) {

      // a dashed, stroked line will be drawn with overlapping rectangles, the background rectangle is slightly taller
      // to mimic stroke
      const width = 16;
      const height = 3;
      const lineDash = [ width / 5, width / 5 ]; // produces 3 segments
      const lineShape = Shape.lineSegment( 0, 0, width, 0 );
      const backgroundLine = new Path( lineShape, {
        lineDash: lineDash,
        lineWidth: height,
        stroke: EnergySkateParkColorScheme.referenceLineStroke
      } );
      const foregroundLine = new Path( lineShape, {
        lineDash: lineDash,
        lineWidth: height * 0.8,
        stroke: EnergySkateParkColorScheme.referenceLineFill
      } );

      return new Node( { children: [ backgroundLine, foregroundLine ] } );
    }

    /**
     * An icon for the "Path" control.
     * @param {Tandem} tandem
     * @returns {Node}
     */
    static createSamplesIcon( tandem ) {

      const circleRadius = 3;

      // positions of circles, for circles and path
      const pointDistance = 3 * circleRadius;
      const firstCenter = new Vector2( -pointDistance, -pointDistance );
      const secondCenter = new Vector2( 0, 0 );
      const thirdCenter = new Vector2( pointDistance, -pointDistance );

      // create three circles
      const circleShape = new Shape();
      circleShape.circle( firstCenter, circleRadius ).newSubpath()
        .circle( secondCenter, circleRadius ).newSubpath()
        .circle( thirdCenter, circleRadius );
      const circlesPath = new Path( circleShape, {
        fill: EnergySkateParkColorScheme.pathFill,
        stroke: EnergySkateParkColorScheme.pathStroke
      } );

      // line connecting each circle
      const lineShape = new Shape().moveToPoint( firstCenter )
        .quadraticCurveToPoint( firstCenter.plusXY( 0, pointDistance ), secondCenter )
        .quadraticCurveToPoint( thirdCenter.plusXY( 0, pointDistance ), thirdCenter );
      const linePath = new Path( lineShape, {
        stroke: EnergySkateParkColorScheme.pathStroke,
        lineWidth: 2
      } );

      return new Node( { children: [ linePath, circlesPath ] } );
    }

    /**
     * Create an icon for the "Sticking to Track" checkbox, a small section of track with the skater's center of
     * mass dot on it.
     *
     * @param {Tandem} tandem
     * @returns {Node}
     */
    static createStickingToTrackIcon() {
      const iconWidth = 16;

      const trackRectangle = new Rectangle( 0, 0, iconWidth, 5, {
        fill: EnergySkateParkColorScheme.roadFill
      } );

      const trackDashes = new Line( 0, 0, iconWidth, 0, {
        fill: EnergySkateParkColorScheme.roadLine,
        stroke: EnergySkateParkColorScheme.roadLine,
        center: trackRectangle.center,
        lineWidth: 1,
        lineDash: [ 2, 1.5 ]
      } );

      const centerOfMassCircle = new Circle( 2, {
        fill: EnergySkateParkColorScheme.particleCircle,
        opacity: 0.7,
        center: trackRectangle.center
      } );

      return new Node( { children: [ trackRectangle, trackDashes, centerOfMassCircle ] } );
    }
  }

  return energySkatePark.register( 'EnergySkateParkCheckboxItem', EnergySkateParkCheckboxItem );
} );
