export type MqttAccessLevel = 1 | 2 | 3 | 4;

export interface MqttAccessOptions {
    topic: string;
    clientid: string;
    /** 1 read, 2 write, 3 readwrite, 4 subscribe */
    acc: MqttAccessLevel;
}
