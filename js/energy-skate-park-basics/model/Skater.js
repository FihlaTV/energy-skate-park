// Copyright 2013-2015, University of Colorado Boulder

/**
 * Model for the skater in Energy Skate Park: Basics, including position, velocity, energy, etc..
 * All units are in meters.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var energySkateParkBasics = require( 'ENERGY_SKATE_PARK_BASICS/energySkateParkBasics' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Emitter = require( 'AXON/Emitter' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Vector2 = require( 'DOT/Vector2' );
  var Util = require( 'DOT/Util' );
  var Constants = require( 'ENERGY_SKATE_PARK_BASICS/energy-skate-park-basics/Constants' );

  // phet-io modules
  var TVector2 = require( 'DOT/TVector2' );
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TString = require( 'ifphetio!PHET_IO/types/TString' );
  var TTrack = require( 'ENERGY_SKATE_PARK_BASICS/energy-skate-park-basics/model/TTrack' );
  var TTrackReference = require( 'ENERGY_SKATE_PARK_BASICS/energy-skate-park-basics/model/TTrackReference' );

  // Compare two arrays, whose elements have 'equals' methods for comparison
  var arrayEquals = function( a, b ) {
    if ( a.length !== b.length ) {
      return false;
    }
    for ( var i = 0; i < a.length; i++ ) {
      var elm1 = a[ i ];
      var elm2 = b[ i ];
      if ( !elm1.equals( elm2 ) ) {
        return false;
      }
    }
    return true;
  };

  function Skater( tandem ) {
    var self = this;

    // The track the skater is on, or null if free-falling
    this.trackProperty = new Property( null, {
      tandem: tandem.createTandem( 'trackProperty' ),
      phetioValueType: TTrackReference
    } );

    // Parameter along the parametric spline, unitless since it is in parametric space
    this.parametricPositionProperty = new Property( 0, {
      tandem: tandem.createTandem( 'parametricPositionProperty' ),
      phetioValueType: TNumber()
    } );

    // Speed along the parametric spline dimension, formally 'u dot', indicating speed and direction (+/-) along the
    // track spline in meters per second.  Not technically the derivative of 'u' since it is the euclidean speed.
    this.parametricSpeedProperty = new Property( 0, {
      tandem: tandem.createTandem( 'parametricSpeedProperty' ),
      phetioValueType: TNumber()
    } );

    // True if the skater is pointing up on the track, false if attached to underside of track
    this.onTopSideOfTrackProperty = new Property( true, {
      tandem: tandem.createTandem( 'onTopSideOfTrackProperty' ),
      phetioValueType: TBoolean
    } );

    // Gravity magnitude and direction
    this.gravityProperty = new Property( -9.8, {
      tandem: tandem.createTandem( 'gravityProperty' ),
      phetioValueType: TNumber( { units: 'meters/second/second', range: { min: -100, max: 1E-6 } } )
    } );

    this.positionProperty = new Property( new Vector2( 3.5, 0 ), {
      tandem: tandem.createTandem( 'positionProperty' ),
      phetioValueType: TVector2
    } );

    // Start in the middle of the MassControlPanel range
    this.massProperty = new Property( Constants.DEFAULT_MASS, {
      tandem: tandem.createTandem( 'massProperty' ),
      phetioValueType: TNumber( { units: 'kilograms' } )
    } );

    // Which way the skater is facing, right or left.  Coded as strings instead of boolean in case we add other states
    // later like 'forward'
    this.directionProperty = new Property( 'left', {
      tandem: tandem.createTandem( 'directionProperty' ),
      phetioValueType: TString
    } );

    this.velocityProperty = new Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'velocityProperty' ),
      phetioValueType: TVector2
    } );

    // True if the user is dragging the skater with a pointer
    this.draggingProperty = new Property( false, {
      tandem: tandem.createTandem( 'draggingProperty' ),
      phetioValueType: TBoolean
    } );

    // Energies are in Joules
    this.kineticEnergyProperty = new Property( 0, {
      tandem: tandem.createTandem( 'kineticEnergyProperty' ),
      phetioValueType: TNumber( { units: 'joules' } )
    } );

    this.potentialEnergyProperty = new Property( 0, {
      tandem: tandem.createTandem( 'potentialEnergyProperty' ),
      phetioValueType: TNumber( { units: 'joules' } )
    } );

    this.thermalEnergyProperty = new Property( 0, {
      tandem: tandem.createTandem( 'thermalEnergyProperty' ),
      phetioValueType: TNumber( { units: 'joules' } )
    } );

    this.totalEnergyProperty = new Property( 0, {
      tandem: tandem.createTandem( 'totalEnergyProperty' ),
      phetioValueType: TNumber( { units: 'joules' } )
    } );

    // The skater's angle (about the pivot point at the bottom center), in radians
    this.angleProperty = new Property( 0, {
      tandem: tandem.createTandem( 'angleProperty' ),
      phetioValueType: TNumber( { units: 'radians' } )
    } );

    // Returns to this point when pressing "return skater"
    this.startingPositionProperty = new Property( new Vector2( 3.5, 0 ), {
      tandem: tandem.createTandem( 'startingPositionProperty' ),
      phetioValueType: TVector2
    } );

    // Returns to this parametric position along the track when pressing "return skater"
    this.startingUProperty = new Property( 0, {
      tandem: tandem.createTandem( 'startingUProperty' ),
      phetioValueType: TNumber()
    } );

    this.startingUpProperty = new Property( true, {
      tandem: tandem.createTandem( 'startingUpProperty' ),
      phetioValueType: TBoolean
    } );

    // Returns to this track when pressing "return skater"
    this.startingTrackProperty = new Property( null, {
      tandem: tandem.createTandem( 'startingTrackProperty' ),
      phetioValueType: TTrack
    } );

    // Position of the skater's head, for positioning the pie chart.
    this.headPositionProperty = new Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'headPositionProperty' ),
      phetioValueType: TVector2
    } );

    Property.preventGetSet( this, 'track' );
    Property.preventGetSet( this, 'parametricPosition' );
    Property.preventGetSet( this, 'parametricSpeed' );
    Property.preventGetSet( this, 'onTopSideOfTrack' );
    Property.preventGetSet( this, 'gravity' );
    Property.preventGetSet( this, 'position' );
    Property.preventGetSet( this, 'mass' );
    Property.preventGetSet( this, 'direction' );
    Property.preventGetSet( this, 'velocity' );
    Property.preventGetSet( this, 'dragging' );
    Property.preventGetSet( this, 'kineticEnergy' );
    Property.preventGetSet( this, 'potentialEnergy' );
    Property.preventGetSet( this, 'thermalEnergy' );
    Property.preventGetSet( this, 'totalEnergy' );
    Property.preventGetSet( this, 'angle' );
    Property.preventGetSet( this, 'startingPosition' );
    Property.preventGetSet( this, 'startingU' );
    Property.preventGetSet( this, 'startingUp' );
    Property.preventGetSet( this, 'startingTrack' );
    Property.preventGetSet( this, 'headPosition' );

    this.updatedEmitter = new Emitter();
    this.energyChangedEmitter = new Emitter();

    this.speedProperty = new DerivedProperty( [ this.velocityProperty ], function( velocity ) {
      return velocity.magnitude();
    }, {
      tandem: tandem.createTandem( 'speedProperty' ),
      phetioValueType: TNumber( { units: 'meters/second' } )
    } );
    Property.preventGetSet( this, 'speed' );

    // Zero the kinetic energy when dragging, see #22
    this.draggingProperty.link( function( dragging ) {
      if ( dragging ) {
        self.velocityProperty.value = new Vector2( 0, 0 );
      }
    } );

    this.parametricSpeedProperty.link( function( parametricSpeed ) {

      // Require the skater to overcome a speed threshold so he won't toggle back and forth rapidly at the bottom of a
      // well with friction, see #51
      var speedThreshold = 0.01;

      if ( parametricSpeed > speedThreshold ) {
        self.directionProperty.value = self.onTopSideOfTrackProperty.value ? 'right' : 'left';
      }
      else if ( parametricSpeed < -speedThreshold ) {
        self.directionProperty.value = self.onTopSideOfTrackProperty.value ? 'left' : 'right';
      }
      else {
        // Keep the same direction
      }
    } );

    // Boolean flag that indicates whether the skater has moved from his initial position, and hence can be 'returned',
    // For making the 'return skater' button enabled/disabled
    // If this is a performance concern, perhaps it could just be dropped as a feature
    this.movedProperty = new DerivedProperty( [ this.positionProperty, this.startingPositionProperty, this.draggingProperty ],
      function( x, x0, dragging ) {
        return !dragging && (x.x !== x0.x || x.y !== x0.y);
      }, {
        tandem: tandem.createTandem( 'movedProperty' ),
        phetioValueType: TBoolean
      } );
    Property.preventGetSet( this, 'moved' );

    this.massProperty.link( function() { self.updateEnergy(); } );

    this.updateEnergy();

    this.updatedEmitter.addListener( function() {
      self.updateHeadPosition();
    } );

    // Enable the "Clear Thermal" buttons but only if the thermal energy exceeds a tiny threshold, so there aren't visual
    // "false positives", see #306
    this.allowClearingThermalEnergyProperty = new DerivedProperty( [ this.thermalEnergyProperty ],
      function( thermalEnergy ) {
        return thermalEnergy > 1E-2;
      }, {
        tandem: tandem.createTandem( 'allowClearingThermalEnergyProperty' ),
        phetioValueType: TBoolean
      } );
    Property.preventGetSet( this, 'allowClearingThermalEnergy' );

    // In the state.html wrapper, when the state changes, we must update the skater node
    phet.phetIo && phet.phetIo.phetio.setStateEmitter && phet.phetIo.phetio.setStateEmitter.addListener( function() {
      self.updatedEmitter.emit();
    } );
  }

  energySkateParkBasics.register( 'Skater', Skater );

  return inherit( Object, Skater, {

    // Get the vector from feet to head, so that when tracks are joined we can make sure he is still pointing up
    get upVector() { return this.headPositionProperty.value.minus( this.positionProperty.value ); },

    clearThermal: function() {
      this.thermalEnergyProperty.value = 0.0;
      this.updateEnergy();
    },

    reset: function() {
      // set the angle to zero before calling PropertySet.prototype.reset so that the optimization for
      // SkaterNode.updatePosition is maintained, without showing the skater at the wrong angle
      this.angleProperty.value = 0;
      this.trackProperty.reset();
      this.parametricPositionProperty.reset();
      this.parametricSpeedProperty.reset();
      this.onTopSideOfTrackProperty.reset();
      this.gravityProperty.reset();
      this.positionProperty.reset();
      this.massProperty.reset();
      this.directionProperty.reset();
      this.velocityProperty.reset();
      this.draggingProperty.reset();
      this.kineticEnergyProperty.reset();
      this.potentialEnergyProperty.reset();
      this.thermalEnergyProperty.reset();
      this.totalEnergyProperty.reset();
      this.angleProperty.reset();
      this.startingPositionProperty.reset();
      this.startingUProperty.reset();
      this.startingUpProperty.reset();
      this.startingTrackProperty.reset();
      this.headPositionProperty.reset();
      this.updateEnergy();

      // Notify the graphics to re-render.  See #223
      this.updatedEmitter.emit();
    },

    // Move the skater to her initial position, but leave the friction and mass the same, see #237
    resetPosition: function() {
      // set the angle to zero before calling PropertySet.prototype.reset so that the optimization for
      // SkaterNode.updatePosition is maintained, without showing the skater at the wrong angle
      this.angleProperty.value = 0;
      var mass = this.massProperty.value;

      // TODO: avoid duplication
      this.trackProperty.reset();
      this.parametricPositionProperty.reset();
      this.parametricSpeedProperty.reset();
      this.onTopSideOfTrackProperty.reset();
      this.gravityProperty.reset();
      this.positionProperty.reset();
      this.massProperty.reset();
      this.directionProperty.reset();
      this.velocityProperty.reset();
      this.draggingProperty.reset();
      this.kineticEnergyProperty.reset();
      this.potentialEnergyProperty.reset();
      this.thermalEnergyProperty.reset();
      this.totalEnergyProperty.reset();
      this.angleProperty.reset();
      this.startingPositionProperty.reset();
      this.startingUProperty.reset();
      this.startingUpProperty.reset();
      this.startingTrackProperty.reset();
      this.headPositionProperty.reset();
      this.massProperty.value = mass;
      this.updateEnergy();

      // Notify the graphics to re-render.  See #223
      this.updatedEmitter.emit();
    },

    // When the scene (track) is changed, the skater's position & velocity reset, but the mass and other properties
    // do not reset, see #179
    returnToInitialPosition: function() {

      // Everything needs to be reset except the mass, see #188
      var mass = this.massProperty.value;
      this.reset();
      this.massProperty.value = mass;
    },

    // Return the skater to the last location it was released by the user (or its starting location)
    // Including the position on a track (if any)
    returnSkater: function() {

      // If the user is on the same track as where he began (and the track hasn't changed), remain on the track,
      // see #143 and #144
      if ( this.startingTrackProperty.value && this.trackProperty.value === this.startingTrackProperty.value && arrayEquals( this.trackProperty.value.copyControlPointSources(), this.startingTrackControlPointSources ) ) {
        this.parametricPositionProperty.value = this.startingUProperty.value;
        this.angleProperty.value = this.startingAngle;
        this.onTopSideOfTrackProperty.value = this.startingUpProperty.value;
        this.parametricSpeedProperty.value = 0;
      }
      else {
        this.trackProperty.value = null;
        this.angleProperty.value = this.startingAngle;
      }
      this.positionProperty.set( this.startingPositionProperty.value.copy() );
      this.velocityProperty.value = new Vector2( 0, 0 );
      this.clearThermal();
      this.updateEnergy();
      this.updatedEmitter.emit();
    },

    // Update the energies as a batch.  This is an explicit method instead of linked to all dependencies so that it can
    // be called in a controlled fashion when multiple dependencies have changed, for performance.
    updateEnergy: function() {
      this.kineticEnergyProperty.value = 0.5 * this.massProperty.value * this.velocityProperty.value.magnitudeSquared();
      this.potentialEnergyProperty.value = -this.massProperty.value * this.positionProperty.value.y * this.gravityProperty.value;
      this.totalEnergyProperty.value = this.kineticEnergyProperty.value + this.potentialEnergyProperty.value + this.thermalEnergyProperty.value;

      // Signal that energies have changed for coarse-grained listeners like PieChartNode that should not get updated
      // 3-4 times per times step
      this.energyChangedEmitter.emit();
    },

    // Update the head position for showing the pie chart.
    // Doesn't depend on "up" because it already depends on the angle of the skater.
    // Would be better if headPosition were a derived property, but created too many allocations, see #50
    updateHeadPosition: function() {

      // Center pie chart over skater's head not his feet so it doesn't look awkward when skating in a parabola
      // Note this has been tuned independently of SkaterNode.massToScale, which also accounts for the image dimensions
      var skaterHeight = Util.linear( Constants.MIN_MASS, Constants.MAX_MASS, 1.65, 2.4, this.massProperty.value );

      var vectorX = skaterHeight * Math.cos( this.angleProperty.value - Math.PI / 2 );
      var vectorY = skaterHeight * Math.sin( this.angleProperty.value - Math.PI / 2 );

      // Manually trigger notifications to avoid allocations, see #50
      this.headPositionProperty.value.x = this.positionProperty.value.x + vectorX;
      this.headPositionProperty.value.y = this.positionProperty.value.y - vectorY;
      this.headPositionProperty.notifyListenersStatic();
    },

    /**
     * If the skater is released, store the initial conditions for when the skater is returned.
     * @param targetTrack The track to start on (if any)
     * @param targetU The parametric location along the track to start on (if any)
     */
    released: function( targetTrack, targetU ) {
      this.draggingProperty.value = false;
      this.velocityProperty.value = new Vector2( 0, 0 );
      this.parametricSpeedProperty.value = 0;
      this.trackProperty.value = targetTrack;
      this.parametricPositionProperty.value = targetU;
      if ( targetTrack ) {
        this.positionProperty.value = targetTrack.getPoint( this.parametricPositionProperty.value );
      }
      this.startingPositionProperty.value = this.positionProperty.value.copy();
      this.startingUProperty.value = targetU;
      this.startingUpProperty.value = this.onTopSideOfTrackProperty.value;
      this.startingTrackProperty.value = targetTrack;

      // Record the starting track control points to make sure the track hasn't changed during return this.
      this.startingTrackControlPointSources = targetTrack ? targetTrack.copyControlPointSources() : [];
      this.startingAngle = this.angleProperty.value;

      // Update the energy on skater release so it won't try to move to a different height to make up for the delta
      this.updateEnergy();
      this.updatedEmitter.emit();
    }
  } );
} );
