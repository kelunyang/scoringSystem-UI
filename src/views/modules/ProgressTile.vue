<template>
    <v-main class='pa-5 ma-0 d-flex'>
        <v-row class='pa-5'>
            <v-col class='d-flex flex-row pa-0'>
                <span class='text-subtitle-1 text-left font-weight-bold'>{{ title }}</span>
                <v-spacer></v-spacer>
                <span v-if="historyList.length > 0">
                    <font-awesome-icon icon='bullhorn' />{{ historyList[0].message }}[{{ historyList[0].user.name }} @ {{ dateConvert(historyList[0].date) }}]
                </span>
            </v-col>
        </v-row>
        <v-row>
            <v-col class='flex-grow-1 pa-0'>
                <v-stepper v-model='currentStep'>
                    <v-stepper-header>
                        <template v-for='step in mixedSteps'>
                            <v-stepper-step
                                :key='"step" + step.step'
                                :step='step.step'
                                :rules='[() => !step.special]'
                                :complete='step.step < currentStep'
                                complete-icon='fa-check-circle'
                                error-icon='fa-bomb'
                            >
                                {{ step.name }}
                                <small>{{ dateConvert(step.date) }}</small>
                            </v-stepper-step>
                            <v-divider v-if='step.step !== progressSteps.length' :key='step.step'></v-divider>
                        </template>
                    </v-stepper-header>
                </v-stepper>
            </v-col>
            <v-col class='d-flex flex-row align-center flex-grow-0 pa-0 ml-5 mr-5'>
                <v-btn v-for='(command, k) in externalCommands' :key='"btn" + k' icon @click.stop='executeFn(command.Fn)'>
                    <font-awesome-icon :icon='command.icon'/>
                </v-btn>
                <v-btn icon @click="expand = !expand">
                    <font-awesome-icon icon='ellipsis-v'/>
                </v-btn>
                <v-checkbox v-if='enableSelected' off-icon="far fa-square" on-icon="fa-check-square" v-model='selectedItem' value='true'></v-checkbox>
            </v-col>
        </v-row>
        <v-expand-transition>
            <v-row v-show="expand">
                <v-col>
                    <v-timeline dense reverse>
                        <v-timeline-item
                            v-for="(item, n) in historyList"
                            :key="n"
                            fill-dot
                        >
                            <template v-slot:icon>
                                <v-avatar>
                                    <img :src='"https://avatars.dicebear.com/api/" + item.user.type + "/" + encodeURIComponent(item.user.name) + ".svg"'>
                                </v-avatar>
                            </template>
                            <v-card class="elevation-2">
                            <v-card-text class='text-body-1 text-right'>
                                <span class='text-subtitle-2 font-weight-black'>{{ item.user.name }} @ {{ dateConvert(item.date) }} </span> :  {{ item.message }}
                            </v-card-text>
                            </v-card>
                        </v-timeline-item>
                    </v-timeline>
                </v-col>
            </v-row>
        </v-expand-transition>
    </v-main>
</template>

<script>
import moment from 'moment';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
    name: 'ProgressTile',
    props: {
        progressItem: Object,
        externalCommands: Array,
        enableSelected: Boolean
    },
    methods: {
        dateConvert: function (time) {
            return time === 0 ? '未發生' : time === 1 ? '當前步驟' : moment.unix(time).format('YYYY/MM/DD HH:mm:ss');
        },
        executeFn: function (Fn) {
            Fn(this.progressItem.id);
        }
    },
    watch: {
        selectedItem: function () {
            this.$emit('valueUpdated', {
                value: this.progressItem,
                checked: this.selectedItem
            });
        }
    },
    computed: {
        mixedSteps: function () {
            let oriobj = this;
            let newArr = [...this.progressSteps];
            newArr.forEach((item) => {
                let foundItem = oriobj.currentSteps.filter((cstep) => {
                    return item.step === cstep.step;
                });
                let currentItem = foundItem.length > 0 ? foundItem[0] : {
                    date: 0,
                    special: false
                };
                item.date = currentItem.date;
                item.special = currentItem.special;
            });
            return newArr;
        }
    },
    data () {
        return {
            enableSelectedD: this.enableSelected === undefined ? false : this.enableSelected,
            selected: null,
            selectedItem: null,
            title: this.progressItem.title,
            expand: false,
            historyList: this.progressItem.historyList,
            currentStep: this.progressItem.currentStep,
            progressSteps: [
                {
                    name: '前置階段',
                    step: 1
                },
                {
                    name: '腳本／分鏡圖階段',
                    step: 2
                },
                {
                    name: '影片階段',
                    step: 3
                },
                {
                    name: '驗收階段',
                    step: 4
                }
            ],
            currentSteps: this.progressItem.currentSteps
        };
    },
    mounted () {
    },
    beforeDestroy () {
    }
};
</script>
