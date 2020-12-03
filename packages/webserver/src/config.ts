import { ServerOptions } from './adapter';

export const CONFIG_NAME = 'webserver';

export const schema = {
  anyOf: [
    {
      allOf: [
        {
          properties: {
            host: {
              type: 'string',
            },
            port: {
              type: 'number',
            },
          },
          required: ['port'],
          type: 'object',
        },
        {
          properties: {
            certificate: {
              type: 'string',
            },
            isSecured: {
              enum: [true],
              type: 'boolean',
            },
            privateKey: {
              type: 'string',
            },
          },
          required: ['certificate', 'isSecured', 'privateKey'],
          type: 'object',
        },
      ],
    },
    {
      allOf: [
        {
          properties: {
            host: {
              type: 'string',
            },
            port: {
              type: 'number',
            },
          },
          required: ['port'],
          type: 'object',
        },
        {
          properties: {
            isSecured: {
              enum: [false],
              type: 'boolean',
            },
          },
          type: 'object',
        },
      ],
    },
  ],
};

export type Config = ServerOptions;
