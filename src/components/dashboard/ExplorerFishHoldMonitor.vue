<script setup lang="ts">
import { ref } from 'vue';
import FishHoldIndicator from './FishHoldIndicator.vue';

// Define the coordinates and data for each Fish Hold
interface FishHold {
  id: string;
  name: string;
  temp: number | null;
  // Position percentages defining the black rectangle where the temp should be rendered
  top: string;
  left: string;
  width: string;
  height: string;
}

// Approximate positions based on the provided image, adapted for 11 holds distributed uniformly (identical to Moacona)
const fishHolds = ref<FishHold[]>([
  // Port (P) Side - Top Row (from stern to bow, holds 11 down to 2)
  { id: '11p', name: 'No.11 (P)', temp: -14.7, top: '39.9%', left: '0.9%', width: '5.5%', height: '5%' },
  { id: '10p', name: 'No.10 (P)', temp: -15.7, top: '39.9%', left: '9%', width: '5.5%', height: '5%' },
  { id: '9p', name: 'No.9 (P)', temp: -15.3, top: '39.9%', left: '17.8%', width: '5.5%', height: '5%' },
  { id: '8p', name: 'No.8 (P)', temp: -14.2, top: '43.5%', left: '26.5%', width: '5.5%', height: '5%' },
  { id: '7p', name: 'No.7 (P)', temp: -15.5, top: '43.5%', left: '35.5%', width: '5.5%', height: '5%' },
  { id: '6p', name: 'No.6 (P)', temp: -14.7, top: '43.5%', left: '44.1%', width: '5.5%', height: '5%' },
  { id: '5p', name: 'No.5 (P)', temp: -15.7, top: '43.5%', left: '53.0%', width: '5.5%', height: '5%' },
  { id: '4p', name: 'No.4 (P)', temp: -15.3, top: '43.5%', left: '61.6%', width: '5.5%', height: '5%' },
  { id: '3p', name: 'No.3 (P)', temp: -14.2, top: '43.5%', left: '70.5%', width: '5.5%', height: '5%' },
  { id: '2p', name: 'No.2 (P)', temp: -15.5, top: '43.5%', left: '79.4%', width: '5.5%', height: '5%' },

  // Bow
  { id: '1', name: 'No.1', temp: -15.2, top: '54.9%', left: '88%', width: '5.5%', height: '5%' },

  // Starboard (S) Side - Bottom Row (from stern to bow, holds 11 down to 2)
  { id: '11s', name: 'No.11 (S)', temp: -14.8, top: '69.2%', left: '0.9%', width: '5.5%', height: '5%' },
  { id: '10s', name: 'No.10 (S)', temp: -14.4, top: '69.2%', left: '9%', width: '5.5%', height: '5%' },
  { id: '9s', name: 'No.9 (S)', temp: -15.4, top: '69.2%', left: '17.8%', width: '5.5%', height: '5%' },
  { id: '8s', name: 'No.8 (S)', temp: -14.9, top: '65.7%', left: '26.5%', width: '5.5%', height: '5%' },
  { id: '7s', name: 'No.7 (S)', temp: -14.5, top: '65.7%', left: '35.5%', width: '5.5%', height: '5%' },
  { id: '6s', name: 'No.6 (S)', temp: -14.8, top: '65.7%', left: '44.1%', width: '5.5%', height: '5%' },
  { id: '5s', name: 'No.5 (S)', temp: -14.4, top: '65.7%', left: '53.0%', width: '5.5%', height: '5%' },
  { id: '4s', name: 'No.4 (S)', temp: -16.2, top: '65.7%', left: '61.6%', width: '5.5%', height: '5%' },
  { id: '3s', name: 'No.3 (S)', temp: -15.0, top: '65.7%', left: '70.5%', width: '5.5%', height: '5%' },
  { id: '2s', name: 'No.2 (S)', temp: -15.9, top: '65.7%', left: '79.4%', width: '5.5%', height: '5%' },
]);

const emit = defineEmits(['select-tank']);

const getPv2Top = (topStr: string) => {
  const topVal = parseFloat(topStr);
  return (topVal + 5.5) + '%';
};
</script>

<template>
  <div class="monitor-container">
    <div class="blueprint-wrapper">
      <div class="image-container">
        <img src="@/assets/blueprint_moacona.png" alt="Ship Blueprint" class="ship-bg" />
        
        <!-- PV1 Temperature overlays -->
        <div 
          v-for="tank in fishHolds" 
          :key="tank.id + '_pv1'"
          class="tank-overlay"
          @click="emit('select-tank', tank)"
          :style="{
            top: tank.top,
            left: tank.left,
            width: tank.width,
            height: tank.height
          }"
        >
          <FishHoldIndicator :temp="tank.temp" />
        </div>

        <!-- PV2 Temperature overlays -->
        <div 
          v-for="tank in fishHolds" 
          :key="tank.id + '_pv2'"
          class="tank-overlay"
          @click="emit('select-tank', tank)"
          :style="{
            top: getPv2Top(tank.top),
            left: tank.left,
            width: tank.width,
            height: tank.height
          }"
        >
          <FishHoldIndicator :temp="tank.temp" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-container {
  padding: 32px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.blueprint-wrapper {
  position: relative;
  width: 100%;
  max-width: 1600px;
  flex-grow: 1;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.image-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  display: block;
}

.ship-bg {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0px 10px 20px rgba(0,0,0,0.1));
}

.tank-overlay {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
  background: rgba(0,0,0,0.01);
  border-radius: 4px;
}

.tank-overlay:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
  z-index: 10;
}
</style>
