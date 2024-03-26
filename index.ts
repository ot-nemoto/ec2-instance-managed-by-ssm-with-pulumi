import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

const config = new pulumi.Config();

// =============================================================================
// Networking
// =============================================================================
const mainVpc = new aws.ec2.Vpc('main', {
    cidrBlock: '10.0.0.0/16',
    enableDnsHostnames: true,

    tags: {
        Name: config.name,
    },
});

const privateSubnet = new aws.ec2.Subnet('private', {
    vpcId: mainVpc.id,
    cidrBlock: '10.0.1.0/24',

    tags: {
        Name: config.name,
    },
});

// =============================================================================
// Compute
// =============================================================================
const assumeRole = aws.iam.getPolicyDocument({
    statements: [
        {
            effect: 'Allow',
            principals: [
                {
                    type: 'Service',
                    identifiers: ['ec2.amazonaws.com'],
                },
            ],
            actions: ['sts:AssumeRole'],
        },
    ],
});
const role = new aws.iam.Role('role', {
    assumeRolePolicy: assumeRole.then((assumeRole) => assumeRole.json),
    managedPolicyArns: ['arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'],

    tags: {
        Name: config.name,
    },
});
const profile = new aws.iam.InstanceProfile('profile', {
    role: role.name,
});

const instance = new aws.ec2.Instance('instance', {
    ami: 'ami-0eba6c58b7918d3a1',
    instanceType: 't2.micro',
    subnetId: privateSubnet.id,
    iamInstanceProfile: profile,

    tags: {
        Name: config.name,
    },
});

export const instance_id = instance.id;
