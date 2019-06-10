// Copyright 2019, University of Colorado Boulder

/**
 * TODO: Typedoc
 * 
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  const ABSwitch = require( 'SUN/ABSwitch' );
  const AccordionBox = require( 'SUN/AccordionBox' );
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const EraserButton = require( 'SCENERY_PHET/buttons/EraserButton' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Text = require( 'SCENERY/nodes/Text' );
  const EnergySkateParkColorScheme = require( 'ENERGY_SKATE_PARK/energy-skate-park/view/EnergySkateParkColorScheme' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const XYPlot = require( 'GRIDDLE/XYPlot' );
  const XYDataSeries = require( 'GRIDDLE/XYDataSeries' );
  const VerticalCheckboxGroup = require( 'SUN/VerticalCheckboxGroup' );

  // strings
  const kineticEnergyLabelString = require( 'string!ENERGY_SKATE_PARK/kineticEnergyLabel' );
  const potentialEnergyLabelString = require( 'string!ENERGY_SKATE_PARK/potentialEnergyLabel' );
  const thermalEnergyLabelString = require( 'string!ENERGY_SKATE_PARK/thermalEnergyLabel' );
  const totalEnergyLabelString = require( 'string!ENERGY_SKATE_PARK/totalEnergyLabel' );
  const timeLabelString = require( 'string!ENERGY_SKATE_PARK/timeLabel' );
  const positionLabelString = require( 'string!ENERGY_SKATE_PARK/positionLabel' );

  class EnergyGraphAccordionBox extends AccordionBox {

    /**
     * TODO: JSDOC
     */
    constructor( model, options ) {

      // the parent for all content of the accordion box
      const contentNode = new Node();

      // check boxes for visibility of energy data
      const checkboxGroup = new VerticalCheckboxGroup( [
        EnergyGraphAccordionBox.createCheckboxItem( model.kineticEnergyDataVisibleProperty, kineticEnergyLabelString, EnergySkateParkColorScheme.kineticEnergy ),
        EnergyGraphAccordionBox.createCheckboxItem( model.potentialEnergyDataVisibleProperty, potentialEnergyLabelString, EnergySkateParkColorScheme.potentialEnergy ),
        EnergyGraphAccordionBox.createCheckboxItem( model.thermalEnergyDataVisibleProperty, thermalEnergyLabelString, EnergySkateParkColorScheme.thermalEnergy ),
        EnergyGraphAccordionBox.createCheckboxItem( model.totalEnergyDataVisibleProperty, totalEnergyLabelString, EnergySkateParkColorScheme.totalEnergy )
      ] );
      contentNode.addChild( checkboxGroup );

      // all layout is relative to the graph
      const energyPlot = new EnergyXYPlot( model );
      contentNode.addChild( energyPlot );

      const eraserButton = new EraserButton( {
        listener: () => {
          model.clearEnergyData();
          energyPlot.clearEnergyDataSeries();
        }
      } );
      contentNode.addChild( eraserButton );

      const switchLabelOptions = {
        font: new PhetFont( { size: 11 } )
      };
      const variables = model.independentVariables;
      const positionLabel = new Text( positionLabelString, switchLabelOptions );
      const timeLabel = new Text( timeLabelString, switchLabelOptions );
      const variableSwitch = new ABSwitch( model.independentVariableProperty, variables.POSITION, positionLabel, variables.TIME, timeLabel, {
        switchSize: new Dimension2( 40, 20 )
      } );
      contentNode.addChild( variableSwitch );

      // layout, all layout is relative to the energy plot
      checkboxGroup.rightCenter = energyPlot.leftCenter;
      variableSwitch.centerBottom = energyPlot.centerTop;
      eraserButton.rightBottom = energyPlot.rightTop;

      super( contentNode, options );
    }

    static createCheckboxItem( property, labelString, labelFill ) {
      return {
        node: new Text( labelString, {
          fill: labelFill,
          font: new PhetFont( { size: 11 } )
        } ),
        property: property
      };
    }
  }

  /**
   * XY Plot for a energy vs time. Includes labels and zoom buttons to change the zoom along the y axis (energy), and
   * an eraser button that clears the plot.
   */
  class EnergyXYPlot extends XYPlot {

    /**
     * @param {EnergySkateParkModel} model
     */
    constructor( model ) {
      super( {
        width: 475,
        height: 125,

        maxX: 20,
        minY: -3000,
        maxY: 3000,
        stepY: 1000,

        showAxis: false,

        tickLabelFont: new PhetFont( 12 ),

        lineDash: [ 4, 4 ],
        showVerticalIntermediateLines: false,
        showHorizontalIntermediateLines: false
      } );

      // @private
      this.kineticEnergyDataSeries = new XYDataSeries( { color: EnergySkateParkColorScheme.kineticEnergy } );
      this.potentialEnergyDataSeries = new XYDataSeries( { color: EnergySkateParkColorScheme.potentialEnergy } );
      this.thermalEnergyDataSeries = new XYDataSeries( { color: EnergySkateParkColorScheme.thermalEnergy } );
      this.totalEnergyDataSeries = new XYDataSeries( { color: EnergySkateParkColorScheme.totalEnergy } );

      model.skaterSamples.addItemAddedListener( skaterState => {
        this.kineticEnergyDataSeries.addPoint( skaterState.time, skaterState.getKineticEnergy() );
        this.potentialEnergyDataSeries.addPoint( skaterState.time, skaterState.getPotentialEnergy() );
        this.thermalEnergyDataSeries.addPoint( skaterState.time, skaterState.thermalEnergy );
        this.totalEnergyDataSeries.addPoint( skaterState.time, skaterState.getTotalEnergy() );
      } );

      // series rendered in order, this order matches Java version
      this.addSeries( this.thermalEnergyDataSeries, true );
      this.addSeries( this.potentialEnergyDataSeries, true );
      this.addSeries( this.kineticEnergyDataSeries, true );
      this.addSeries( this.totalEnergyDataSeries, true );

      model.kineticEnergyDataVisibleProperty.linkAttribute( this.seriesViewMap[ this.kineticEnergyDataSeries.uniqueId ], 'visible' );
      model.potentialEnergyDataVisibleProperty.linkAttribute( this.seriesViewMap[ this.potentialEnergyDataSeries.uniqueId ], 'visible' );
      model.thermalEnergyDataVisibleProperty.linkAttribute( this.seriesViewMap[ this.thermalEnergyDataSeries.uniqueId ], 'visible' );
      model.totalEnergyDataVisibleProperty.linkAttribute( this.seriesViewMap[ this.totalEnergyDataSeries.uniqueId ], 'visible' );
    }

    clearEnergyDataSeries() {
      this.kineticEnergyDataSeries.clear();
      this.potentialEnergyDataSeries.clear();
      this.thermalEnergyDataSeries.clear();
      this.totalEnergyDataSeries.clear();
    }
  }

  return energySkatePark.register( 'EnergyGraphAccordionBox', EnergyGraphAccordionBox );
} );