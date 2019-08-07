// Copyright 2018-2019, University of Colorado Boulder

/**
 * View where you can play with premade tracks which may be configurable, but are not draggable,
 * splittable, or attachable. Premade tracks can be chosen from a set of scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const EnergySkateParkScreenView = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/EnergySkateParkScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var TrackNode = require( 'ENERGY_SKATE_PARK/energy-skate-park/view/TrackNode' );

  function EnergySkateParkTrackSetScreenView( model, controls, tandem, options ) {

    options = _.extend( {

    }, options );

    EnergySkateParkScreenView.call( this, model, controls, tandem, options );


    var trackNodes = model.tracks.getArray().map( track => {
      return new TrackNode( model, track, this.modelViewTransform, this.availableModelBoundsProperty, this.trackNodeGroupTandem.createNextTandem() );
    } );

    trackNodes.forEach( trackNode => {
      this.trackLayer.addChild( trackNode );
    } );

    model.sceneProperty.link( function( scene ) {
      _.forEach( model.tracks, function( track, i ) {
        trackNodes[ i ].visible = scene === i;
      } );
    } );
  }

  energySkatePark.register( 'EnergySkateParkTrackSetScreenView', EnergySkateParkTrackSetScreenView );

  return inherit( EnergySkateParkScreenView, EnergySkateParkTrackSetScreenView,  );
} );
