<template>
  <v-card elevation="4" class="mb-6 pa-4">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">🌍 Sales by Territory</h2>
    <div class="relative w-full">
      <div
        id="map-legend"
        class="absolute left-6 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 shadow-md p-3 text-xs text-gray-700"
      ></div>
      <div id="world-map" class="w-full h-[600px]"></div>
      <div v-show="tooltip.visible" class="absolute tooltip-box" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
        {{ tooltip.text }}
      </div>
    </div>
  </v-card>
</template>

<script setup>
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import iso from 'iso-3166-1';
import { onMounted, reactive, watch } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});
const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  text: ''
});
const drawMap = async () => {
  const container = document.getElementById('world-map');
  const legendContainer = document.getElementById('map-legend');
  if (!container) return;
  container.innerHTML = '';
  legendContainer.innerHTML = '';
  const width = container.clientWidth;
  const height = 600;
  const svg = d3
    .select(container)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', '100%');

  const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  const countries = topojson.feature(world, world.objects.countries).features;
  const dataMap = {};
  props.data.forEach((d) => {
    const isoCode = (d.iso3 || d.code || d.country_code || '').toString().toUpperCase();
    const value = parseFloat(d.value) || 0;
    if (isoCode) dataMap[isoCode] = value;
  });

  const values = Object.values(dataMap);
  const [minVal, maxVal] = d3.extent(values);
  const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([minVal || 0, maxVal || 1]);
  const projection = d3
    .geoNaturalEarth1()
    .scale(width / 6)
    .translate([width / 2, height / 1.9]);
  const path = d3.geoPath(projection);
  svg
    .append('g')
    .selectAll('path')
    .data(countries)
    .join('path')
    .attr('d', path)
    .attr('fill', (d) => {
      const alpha3 = iso.whereNumeric(d.id)?.alpha3 || '';
      const val = dataMap[alpha3];
      return val ? colorScale(val) : '#f5f5f5';
    })
    .attr('stroke', '#d1d5db')
    .attr('stroke-width', 0.8)
    .on('mousemove', (event, d) => {
      const info = iso.whereNumeric(d.id);
      const alpha3 = info?.alpha3 || '';
      const name = info?.country || 'Unknown';
      const val = dataMap[alpha3];

      tooltip.visible = true;
      tooltip.x = event.offsetX + 20;
      tooltip.y = event.offsetY - 40;
      tooltip.text = val ? `${name} (${alpha3}) — ${d3.format(',')(val)}` : `${name} (${alpha3}) — No data`;
    })
    .on('mouseleave', () => {
      tooltip.visible = false;
    });

  // 🎨 Legend
  const legendWidth = 180;
  const legendHeight = 12;
  const legendSvg = d3.select(legendContainer).append('svg').attr('width', legendWidth).attr('height', 60);
  const defs = legendSvg.append('defs');
  const linearGradient = defs
    .append('linearGradient')
    .attr('id', 'legend-gradient')
    .attr('x1', '0%')
    .attr('x2', '100%')
    .attr('y1', '0%')
    .attr('y2', '0%');
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    linearGradient
      .append('stop')
      .attr('offset', `${t * 100}%`)
      .attr('stop-color', colorScale(minVal + t * (maxVal - minVal)));
  }
  legendSvg
    .append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('rx', 5)
    .attr('ry', 5)
    .style('fill', 'url(#legend-gradient)')
    .style('stroke', '#ccc');
  legendSvg.append('text').attr('x', 0).attr('y', 35).attr('fill', '#444').attr('font-size', '11px').text(d3.format('.2s')(minVal));
  legendSvg
    .append('text')
    .attr('x', legendWidth)
    .attr('y', 35)
    .attr('fill', '#444')
    .attr('text-anchor', 'end')
    .attr('font-size', '11px')
    .text(d3.format('.2s')(maxVal));
  legendSvg
    .append('text')
    .attr('x', legendWidth / 2)
    .attr('y', 52)
    .attr('fill', '#555')
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .text('Sales Volume');
};

onMounted(drawMap);
watch(() => props.data, drawMap, { deep: true });
</script>


