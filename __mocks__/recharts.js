'use strict';
const React = require('react');

const MOCK_COMPONENTS = [
  'Area',
  'AreaChart',
  'Bar',
  'BarChart',
  'CartesianGrid',
  'Cell',
  'ComposedChart',
  'Cross',
  'Curve',
  'Dot',
  'ErrorBar',
  'Funnel',
  'FunnelChart',
  'Label',
  'LabelList',
  'Legend',
  'Line',
  'LineChart',
  'Pie',
  'PieChart',
  'PolarAngleAxis',
  'PolarGrid',
  'PolarRadiusAxis',
  'Polygon',
  'Radar',
  'RadarChart',
  'RadialBar',
  'RadialBarChart',
  'Rectangle',
  'ReferenceArea',
  'ReferenceDot',
  'ReferenceLine',
  'ResponsiveContainer',
  'Scatter',
  'ScatterChart',
  'Sector',
  'Text',
  'Tooltip',
  'Treemap',
  'XAxis',
  'YAxis',
  'ZAxis',
];

const createMockComponent = (displayName) => {
  const MockComponent = (props) => {
    return React.createElement('div', props, props.children);
  };
  MockComponent.displayName = displayName;
  return MockComponent;
};

MOCK_COMPONENTS.forEach((componentName) => {
  exports[componentName] = createMockComponent(componentName);
});

exports.Surface = createMockComponent('Surface');
exports.Layer = createMockComponent('Layer');

// A more specific mock for ResponsiveContainer might be needed if you rely on its functionality.
exports.ResponsiveContainer = ({ children }) => {
    return React.createElement('div', { className: 'recharts-responsive-container' }, children);
};
