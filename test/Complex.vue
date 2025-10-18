<template>
  <section>
    <header>Complex Component</header>
    <article v-for="item in items" :key="item.id">{{ item.name }}</article>
  </section>
</template>

<script>
export default {
	data() {
		return {
			items: [
				{ id: 1, name: "A" },
				{ id: 2, name: "B" },
			],
		};
	},
};
</script>

<style>
section { padding: 2rem; }
</style>
