<template>
  <div class="refraction-payment">
    <div id="payment-element-placeholder">Payment Element Placeholder (Vue)</div>
    <button @click="handlePay">Pay</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted } from 'vue';
import type { PaymentProps } from '@refraction-ui/payment';

interface Props extends PaymentProps {
  stripeKey: string;
}

const props = defineProps<Props>();

onMounted(() => {
  console.log('Stripe initialized in Vue component with clientSecret:', props.clientSecret);
});

const handlePay = () => {
  console.log('Pay button clicked');
};
</script>