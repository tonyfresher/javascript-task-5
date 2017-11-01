'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {
        _subscriptions: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Emitter}
         */
        on: function (event, context, handler) {
            if (!this._subscriptions.hasOwnProperty(event)) {
                this._subscriptions[event] = [];
            }

            this._subscriptions[event].push({
                context,
                handler
            });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Emitter}
         */
        off: function (event, context) {
            let subevents = Object.keys(this._subscriptions).filter(
                subscribtion => subscribtion.startsWith(`${event}.`)
            );
            let unsubscribed = [event].concat(subevents);

            unsubscribed
                .filter(item => this._subscriptions[item])
                .forEach(item => {
                    this._subscriptions[item] = this._subscriptions[item].filter(
                        subscription => subscription.context !== context
                    );
                });

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Emitter}
         */
        emit: function (event) {
            let tokens = event.split('.');

            while (tokens.length > 0) {
                let subevent = tokens.join('.');

                // eslint-disable-next-line no-unused-expressions
                this._subscriptions[subevent] && this._subscriptions[subevent].forEach(
                    subscribtion => subscribtion.handler.call(subscribtion.context)
                );

                tokens.pop();
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Emitter}
         */
        several: function (event, context, handler, times) {
            this.on(event, context, this._repeatSeveral(times, context, handler));

            return this;
        },

        /**
         * Декоратор, который выполняет функцию n раз
         * @param {Number} times_ – сколько раз получить уведомление
         * @param {Object} context
         * @param {Function} handler
         * @returns {Function}
         */
        _repeatSeveral: function (times_, context, handler) {
            let period = 0;

            return function (times = times_) {
                if (period < times) {
                    handler.call(context);
                }

                period += 1;
            };
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Emitter}
         */
        through: function (event, context, handler, frequency) {
            this.on(event, context, this._repeatThrough(frequency, context, handler));

            return this;
        },

        /**
         * Декоратор, который выполняет функцию с заданной частотой
         * @param {Number} frequency_ – как часто уведомлять
         * @param {Object} context
         * @param {Function} handler
         * @returns {Function}
         */
        _repeatThrough: function (frequency_, context, handler) {
            let period = 0;

            return function (frequency = frequency_) {
                if (period % frequency === 0) {
                    handler.call(context);
                }

                period += 1;
            };
        }
    };
}
