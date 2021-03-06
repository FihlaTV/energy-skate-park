// Copyright 2019, University of Colorado Boulder

/**
 * A canvas node that draws the measurable path of the skater. This needed to be done with
 * Canvas for better performance on tablets.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const EnergySkateParkColorScheme = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/EnergySkateParkColorScheme' );

  // constants
  const SAMPLE_RADIUS = 3;

  class SkaterSamplesCanvasNode extends CanvasNode {

    /**
     * @param {MeasureModel} model
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( model, modelViewTransform ) {
      super();

      // @private
      this.model = model;
      this.modelViewTransform = modelViewTransform;

      this.model.availableModelBoundsProperty.link( modelBounds => {
        this.canvasBounds = this.modelViewTransform.modelToViewBounds( modelBounds );

        // repaint in case we are paused
        this.invalidatePaint();
      } );
    }

    /**
     * Paints the canvas node.
     *
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas( context ) {
      for ( let i = 0; i < this.model.skaterSamples.length; i++ ) {
        const sample = this.model.skaterSamples.get( i );
        const viewPosition = this.modelViewTransform.modelToViewPosition( sample.position );

        context.beginPath();
        context.arc( viewPosition.x, viewPosition.y, SAMPLE_RADIUS, 0, 2 * Math.PI );

        const alpha = sample.opacityProperty.get();

        context.fillStyle = EnergySkateParkColorScheme.pathFill.withAlpha( alpha ).toCSS();
        context.strokeStyle = EnergySkateParkColorScheme.pathStroke.withAlpha( alpha ).toCSS();

        context.fill();
        context.stroke();
      }
    }

    /**
     * Repaint in the animation frame if playing.
     *
     * @param {number} dt - in seconds
     */
    step( dt ) {
      this.invalidatePaint();
    }
  }

  return energySkatePark.register( 'SkaterSamplesCanvasNode', SkaterSamplesCanvasNode );
} );
