<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="spinner">
    <g >
      <circle class="path" cx="12" cy="12" r="10" fill="none" stroke-width="3"/>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'IconSpinner',
};
</script>

<style scoped>
.spinner {
  animation: rotate 2s linear infinite;
}

.spinner .path {
  stroke: var(--dark);
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

</style>
