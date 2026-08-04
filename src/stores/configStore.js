// state    unit    단위를 저장하는 변수 (초기값:celsius)
// getters  unitSymbol 현재 단위 상태에 맞는 기호
// actions  toggleUnit celsius, fahrenheit를 토글하는 함수
import {ref, computed} from 'vue'
import {defineStore} from 'pinia'

export const useConfigStore = defineStore('config', () => {
    const unit = ref('celsius')

    const unitSymbol = computed(() => {
        return unit.value === 'celsius' ? '℃' : '℉'
    })

    function toggleUnit() {
        unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
    }

    return{unit, unitSymbol, toggleUnit,}
})