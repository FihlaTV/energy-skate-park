// Copyright 2018-2019, University of Colorado Boulder

/**
 * View for the graphs screen in Energy Skate Park.
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const EnergySkateParkTrackSetScreenView = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/EnergySkateParkTrackSetScreenView' );
  const EnergyGraphAccordionBox = require( 'ENERGY_SKATE_PARK/energy-skate-park/graphs/view/EnergyGraphAccordionBox' );
  const FrictionSlider = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/FrictionSlider' );
  const GraphsConstants = require( 'ENERGY_SKATE_PARK/energy-skate-park/graphs/GraphsConstants' );
  const GravityNumberControl = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/GravityNumberControl' );
  const Node = require( 'SCENERY/nodes/Node' );
  const GravityComboBox = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/GravityComboBox' );
  const MassNumberControl = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/view/MassNumberControl' );


  /**
   * @constructor
   * @param {GraphsModel} model
   */
  class GraphsScreenView extends EnergySkateParkTrackSetScreenView {

    /**
     * @param {EnergySkateParkModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {

      // parent layer for ComboBox, would use "this" but it is not available until after super
      const comboBoxParent = new Node();

      const graphsControls = [
        new FrictionSlider( model.frictionProperty, tandem.createTandem( 'frictionSlider' ) ),
        new MassNumberControl( model.skater.massProperty, model.skater.massRange, tandem.createTandem( 'massNumberControl' ) ),
        new GravityNumberControl( model.skater.gravityMagnitudeProperty, tandem.createTandem( 'gravitySlider' ) ),
        new GravityComboBox( model.skater.gravityMagnitudeProperty, model.resetEmitter, comboBoxParent, tandem.createTandem( 'gravityComboBox' ) )
      ];

      super( model, graphsControls, tandem.createTandem( 'graphsScreenView' ), {
        showBarGraph: false,
        visibilityControlsOptions: {
          showPieChartCheckbox: false,
          showGridCheckbox: false,
          showSpeedCheckbox: true,
          showStickToTrackCheckbox: true
        }
      } );

      this.addChild( comboBoxParent );

      // @private - for layout
      this.graphAccordionBox = new EnergyGraphAccordionBox( model, this.modelViewTransform, tandem.createTandem( 'graphAccordionBox' ) );
      this.addToBottomLayer( this.graphAccordionBox );
    }

    /**
     * Special layout for the energy-skate-park, contents can float to the available bounds.
     * @override
     */
    floatInterface() {
      super.floatInterface();

      // the graph within the accordion box needs to line up with the track so that skater positions on the
      // track align perfectly with positions along the graph
      this.graphAccordionBox.right = this.trackLayer.right + EnergyGraphAccordionBox.GRAPH_OFFSET;
      this.graphAccordionBox.top = this.controlPanel.top;

      // special layout for the speedometer in this screen
      this.speedometerNode.left = this.graphAccordionBox.left;
      this.speedometerNode.top = this.modelViewTransform.modelToViewY( GraphsConstants.TRACK_HEIGHT );
    }
  }

  return energySkatePark.register( 'GraphsScreenView', GraphsScreenView );
} );
