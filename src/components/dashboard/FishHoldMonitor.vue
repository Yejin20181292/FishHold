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

// Approximate positions based on the provided image
// The user will need to fine-tune these percentages based on their exact image aspect ratio.
const fishHolds = ref<FishHold[]>([
  // Port (P) Side - Top Row (from stern to bow)
  { id: '10p', name: 'No.10 (P)', temp: -14.5, top: '39.9%', left: '8.6%', width: '6%', height: '5%' },
  { id: '9p', name: 'No.9 (P)', temp: -1.6, top: '39.9%', left: '17.9%', width: '6%', height: '5%' },
  { id: '8p', name: 'No.8 (P)', temp: 3.5, top: '43%', left: '26.3%', width: '6%', height: '5%' },
  { id: '7p', name: 'No.7 (P)', temp: -8.9, top: '43%', left: '35.2%', width: '6%', height: '5%' },
  { id: '6p', name: 'No.6 (P)', temp: -2.2, top: '43%', left: '44.1%', width: '6%', height: '5%' },
  { id: '5p', name: 'No.5 (P)', temp: -3.6, top: '43%', left: '53%', width: '6%', height: '5%' },
  { id: '4p', name: 'No.4 (P)', temp: -1.5, top: '43%', left: '62%', width: '6%', height: '5%' },
  { id: '3p', name: 'No.3 (P)', temp: -0.1, top: '43%', left: '71%', width: '6%', height: '5%' },
  { id: '2p', name: 'No.2 (P)', temp: -10.2, top: '43%', left: '79.3%', width: '6%', height: '5%' },

  // Bow
  { id: '1', name: 'No.1', temp: 20.5, top: '54.5%', left: '88.5%', width: '5%', height: '5%' },

  // Starboard (S) Side - Bottom Row (from stern to bow)
  { id: '10s', name: 'No.10 (S)', temp: -11.1, top: '69.3%', left: '8.6%', width: '6%', height: '5%' },
  { id: '9s', name: 'No.9 (S)', temp: -1.9, top: '69.3%', left: '17.9%', width: '6%', height: '5%' },
  { id: '8s', name: 'No.8 (S)', temp: -1.0, top: '65.5%', left: '26.3%', width: '6%', height: '5%' },
  { id: '7s', name: 'No.7 (S)', temp: -12.1, top: '65.5%', left: '35.2%', width: '6%', height: '5%' },
  { id: '6s', name: 'No.6 (S)', temp: 0.1, top: '65.5%', left: '44.1%', width: '6%', height: '5%' },
  { id: '5s', name: 'No.5 (S)', temp: 0.1, top: '65.5%', left: '53%', width: '6%', height: '5%' },
  { id: '4s', name: 'No.4 (S)', temp: 12.5, top: '65.5%', left: '62%', width: '6%', height: '5%' },
  { id: '3s', name: 'No.3 (S)', temp: -0.6, top: '65.5%', left: '71%', width: '6%', height: '5%' },
  { id: '2s', name: 'No.2 (S)', temp: -0.8, top: '65.5%', left: '79.3%', width: '6%', height: '5%' },
]);

const emit = defineEmits(['select-tank']);
</script>

<template>
  <div class="monitor-container">

    <div class="blueprint-wrapper">
      <div class="image-container">
        <!-- 
          User should place their actual blueprint image at src/assets/blueprint.png
          If missing, this will show a missing image icon, so we put a fallback alt text.
        -->
        <img src="@/assets/blueprint.png" alt="Ship Blueprint" class="ship-bg" />
        
        <!-- Temperature overlays -->
        <div 
          v-for="tank in fishHolds" 
          :key="tank.id"
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
  /* Calculate max-height to avoid overflow, maintaining typical blueprint aspect ratio */
  flex-grow: 1;
  background-color: transparent; /* Assuming image has the beige background, or we can use: #f0f0c0 */
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
  /* Adding a slight shadow for aesthetics */
  filter: drop-shadow(0px 10px 20px rgba(0,0,0,0.1));
}

.tank-overlay {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
  /* Make sure background is interactable if it is fully transparent */
  background: rgba(0,0,0,0.01);
  border-radius: 4px;
}

.tank-overlay:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
  z-index: 10;
}
</style>
