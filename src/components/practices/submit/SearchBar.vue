<!-- Day 2. 실습 과제 - 날씨 (컴포넌트) -->
<!--    부모로부터 검색도시 반응형 데이터를 전달받아 표시 (props)
        도시 검색 시 update-query 이벤트를 발생하면서 검색어를 부모에게 전달 (emits) -->
<script setup>
defineEmits(['update-query'])
defineProps({
    currentQuery: {
        type: String,
        default: '',
    },
})
</script>

<template>
    <div class="search-inner">
        <h3>🔍도시 검색</h3>
        <input type="text" :value="currentQuery" @input="$emit('update-query', $event.target.value)" placeholder="검색할 도시 이름 입력" />
        <p>
            검색 중인 도시: <strong>{{ currentQuery }}</strong>
        </p>
    </div>
</template>