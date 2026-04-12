<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { parseHeadings, observeHeadings, TocItem } from '@refraction-ui/table-of-contents';
import { cn } from '@refraction-ui/shared';

const props = withDefaults(defineProps<{
  selectors?: string;
  class?: any;
}>(), {
  selectors: 'h2, h3, h4',
});

const headings = ref<TocItem[]>([]);
const activeId = ref<string>('');
let disconnect: (() => void) | undefined;

onMounted(() => {
  const container = document.body;
  headings.value = parseHeadings(container, props.selectors);
  
  if (headings.value.length > 0) {
    disconnect = observeHeadings(headings.value.map(h => h.id), (id) => {
      activeId.value = id;
    });
  }
});

onUnmounted(() => {
  if (disconnect) disconnect();
});
</script>

<template>
  <nav :class="cn('space-y-1', props.class)">
    <ul v-if="headings.length" class="m-0 list-none p-0">
      <li 
        v-for="heading in headings" 
        :key="heading.id"
        :class="cn('py-1', heading.level === 3 ? 'pl-4' : heading.level === 4 ? 'pl-8' : '')"
      >
        <a 
          :href="'#' + heading.id"
          :class="cn(
            'block text-sm transition-colors hover:text-foreground',
            activeId === heading.id ? 'font-medium text-foreground' : 'text-muted-foreground'
          )"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>
