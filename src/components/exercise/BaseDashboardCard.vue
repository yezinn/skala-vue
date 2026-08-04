<!-- Day 2. 실습 과제 - 날씨 (컴포넌트) -->
 <!-- 검색 박스와 리스트박스의 디자인을 공통화.
 <slot></slot>배치하여 부모 컴포넌트가 도시 검색, 날씨 현황 주입 -->

<template>
    <div class="base-dashboard-card">
        <slot></slot>
    </div>
</template>

<style scoped>
.base-dashboard-card {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    
}
</style>