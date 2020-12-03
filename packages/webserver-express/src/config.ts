export const CONFIG_NAME = 'webserver-express';

export const schema = {
  properties: {
    settings: {
      additionalProperties: {},
      type: 'object',
    },
  },
  required: ['settings'],
  type: 'object',
};

export interface Config {
  settings: {
    [key: string]: any;
  };
}
