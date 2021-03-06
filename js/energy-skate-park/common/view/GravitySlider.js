// Copyright 2019, University of Colorado Boulder

/**
 * A slider that controls the gravity Property of energy skate park.
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const Constants = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/Constants' );
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const PhysicalSlider = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/PhysicalSlider' );
  const Range = require( 'DOT/Range' );

  // strings
  const controlsGravityString = require( 'string!ENERGY_SKATE_PARK/controls.gravity' );
  const controlsValueTinyString = require( 'string!ENERGY_SKATE_PARK/controls.value.tiny' );

  class GravitySlider extends PhysicalSlider {

    /**
     * @param {NumberProperty} property
     * @param {Tandem} tandems
     */
    constructor( property, tandem ) {
      super( controlsGravityString, property, new Range( Math.abs( Constants.MIN_GRAVITY ), Math.abs( Constants.MAX_GRAVITY ) ), tandem, {
        minLabel: controlsValueTinyString
      } );
    }
  }

  return energySkatePark.register( 'GravitySlider', GravitySlider );
} );
