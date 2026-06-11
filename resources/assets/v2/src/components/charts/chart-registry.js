/**
 * chart-registry.js
 * Registers all Chart.js components globally once.
 * Import this file before any chart component.
 */
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    BarElement,
    BarController,
    ArcElement,
    DoughnutController,
    TimeScale,
    Filler,
    Legend,
    Tooltip,
    Title,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {SankeyController, Flow} from 'chartjs-chart-sankey';

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    BarElement,
    BarController,
    ArcElement,
    DoughnutController,
    TimeScale,
    Filler,
    Legend,
    Tooltip,
    Title,
    SankeyController,
    Flow
);

export {Chart};
