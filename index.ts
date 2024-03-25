import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

const config = new pulumi.Config();

const main = new aws.ec2.Vpc('main', {
    cidrBlock: '10.0.0.0/16',

    tags: {
        Name: config.name,
    },
});
