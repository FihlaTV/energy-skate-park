// Copyright 2017, University of Colorado Boulder

/**
 * Model for the Intro screen in Energy Skate Park.
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  var EnergySkateParkTrackSetModel = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/model/EnergySkateParkTrackSetModel' );

  // constants
  function IntroModel( tandem ) {

    // track set model with no friction
    EnergySkateParkTrackSetModel.call( this, false, tandem.createTandem( 'introModel' ) );
  }

  energySkatePark.register( 'IntroModel', IntroModel );

  return inherit( EnergySkateParkTrackSetModel, IntroModel, {} );
} );
