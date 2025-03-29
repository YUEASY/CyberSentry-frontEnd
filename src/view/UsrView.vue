<template>
    <div class="usr-wrapper">
        <a-row>
            <a-col :flex="4">
                <div v-if="!modiShow">
                    <a-avatar :size="32" shape="square">{{ user.username }}</a-avatar>
                    <div class="usr-container">
                        <div class="usr-head">name</div>
                        <div class="usr-body">{{ user.username }}</div>
                    </div>
                    <div class="usr-container">
                        <div class="usr-head">email</div>
                        <div class="usr-body">{{ user.email }}</div>
                    </div>
                    <div class="usr-container">
                        <div class="usr-head">phone</div>
                        <div class="usr-body">{{ user.phone }}</div>
                    </div>
                    <div class="usr-container">
                        <div class="modi-button" @click="ModiShow">编辑</div>
                    </div>
                </div>
                <div v-else class="modi-div">
                    <div class="usr-container">
                        <div class="usr-head" >phone</div>
                        <a-input v-model="phone" class="name-input" />
                    </div>

                    <div class="usr-container">
                        <div class="modi-button" @click="() => (ModiShow())">保存</div>
                    </div>
                </div>
            </a-col>
            <a-col :flex="6">
                <div>
                    <div>操作记录</div>
                    <ListComponent />
                </div>
            </a-col>    
        </a-row>
    </div>
</template>

<script setup>
import ListComponent from '@/components/ListComponent.vue';
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';

    const modiShow = ref(false)
    const ModiShow = () => {
        modiShow.value = !modiShow.value
    }
    const user = useUserStore()
    const phone = ref(user.phone)

    // const save = () => {
    //     user.update({id: user.id, email: user.email, phone:phone.value, role: user.role})
    // }

</script>



<style scoped>

.modi-button {
    cursor: pointer;
    font-size: 20px;    
    color: rgb(255, 255, 254);
    width: 50px;
    padding: 10px;
    text-align: center;
}

.modi-button:hover {
    background-color: #81818150;
}

.modi-button:active {
    background-color: #81818195;
}

.name-input {
    width: 150px; 
    background-color: rgb(81, 81, 79);
}

.usr-container {
    display: flex;
    align-items: center;
    margin: 10px;
    margin-top: 20px;
}

.usr-head {
    font-size: 20px;
    font-weight: 300;
    margin-right: 10px;
}

.usr-body {
    font-size: 24px;
    color: lightgray;
}

.usr-wrapper {
    color: azure;
    
}

</style>