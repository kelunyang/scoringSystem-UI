<template>
    <v-card>
        <v-card-title class='text-subtitle-2 font-weight-bold text-center d-flex justify-center'>
            <span>{{ label }}截止日期</span>
        </v-card-title>
        <v-card-text class='d-flex flex-column'>
            <span class='text-h6'>{{ computedCountDown.date }}</span>
            <span class='text-h6'>{{ computedCountDown.hour }}</span>
            <span :class='computedCountDown.tip'>{{ computedCountDown.tipWord }}</span>
        </v-card-text>
        <v-card-subtitle v-if='editable'>
            <v-dialog v-model='dialog' persistent max-width='290'>
                <template v-slot:activator='{ on, attrs }'>
                    <v-btn
                        icon
                        v-bind='attrs'
                        v-on='on'
                    >
                        <font-awesome-icon icon='cog'/>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title class='headline'>調整工時</v-card-title>
                    <v-card-text>
                        <v-slider
                            label='重新設定工時'
                            min='1'
                            max='168'
                            v-model='remainingHours'
                            thumb-label
                        ></v-slider>
                    </v-card-text>
                    <v-card-subtitle>{{ computedNewDate.format('YYYY/MM/DD HH:mm') }}</v-card-subtitle>
                    <v-card-actions>
                    <v-btn color='green darken-1' text @click='newTime'>設定完成</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card-subtitle>
    </v-card>
</template>

<script>
import '@fortawesome/fontawesome-free/css/all.css';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

export default {
    name: 'CountDownPanel',
    props: {
        label: String,
        deadline: Number,
        editable: Boolean
    },
    computed: {
        computedCountDown: function () {
            return {
                date: moment.unix(this.deadlineD).format('YYYY/MM/DD'),
                hour: moment.unix(this.deadlineD).format(' HH:mm'),
                tip: this.remainingHours < 48 ? 'red--text text-body-2' : 'text-body-2',
                tipWord: this.remainingHours < 0 ? '逾時' + Math.abs(Math.round(this.remainingHours * 100) / 100) + '個小時' : '剩下' + Math.abs(Math.round(this.remainingHours * 100) / 100) + '個小時'
            };
        },
        computedNewDate: function () {
            return this.deadlineD === undefined ? moment.unix() : moment.unix(this.deadlineD).add(this.remainingHours, 'hour');
        }
    },
    methods: {
        newTime: function () {
            this.dialog = false;
            this.deadlineD = this.computedNewDate.unix();
            this.$emit('valueUpdated', this.deadlineD);
        },
        calcRemain: function () {
            let startTime = moment();
            let endTime = moment.unix(this.deadlineD);
            let duration = moment.duration(endTime.diff(startTime));
            this.remainingHours = duration.asHours();
        }
    },
    watch: {
        deadlineD: function () {
            this.calcRemain();
        }
    },
    mounted () {
        this.calcRemain();
    },
    data () {
        return {
            remainingHours: 0,
            dialog: false,
            deadlineD: this.deadline
        };
    }
};
</script>
