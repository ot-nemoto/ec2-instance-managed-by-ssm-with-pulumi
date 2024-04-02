import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';

const config = new pulumi.Config();

// =============================================================================
// Networking
// =============================================================================

let mainVpc;
if (config.get('vpc_id')) {
    mainVpc = aws.ec2.Vpc.get('main', config.get('vpc_id') || '');
} else {
    mainVpc = new aws.ec2.Vpc('main', {
        cidrBlock: '10.0.0.0/16',
        enableDnsHostnames: true,

        tags: {
            Name: config.name,
        },
    });
}

let privateSubnet;
if (config.get('vpc_id') && config.get('subnet_id')) {
    privateSubnet = aws.ec2.Subnet.get('private', config.get('subnet_id') || '');
} else {
    privateSubnet = new aws.ec2.Subnet('private', {
        vpcId: mainVpc.id,
        cidrBlock: '10.0.1.0/24',

        tags: {
            Name: config.name,
        },
    });
}

const securityGroup = new aws.ec2.SecurityGroup('vpc_endpoint', {
    vpcId: mainVpc.id,

    tags: {
        Name: config.name,
    },
});

const ingressRule = new aws.vpc.SecurityGroupIngressRule('allow_tls_ipv4', {
    securityGroupId: securityGroup.id,
    cidrIpv4: mainVpc.cidrBlock,
    ipProtocol: 'tcp',
    fromPort: 443,
    toPort: 443,
});

const egressRule = new aws.vpc.SecurityGroupEgressRule('allow_all_traffic_ipv4', {
    securityGroupId: securityGroup.id,
    cidrIpv4: '0.0.0.0/0',
    ipProtocol: '-1',
});

const ssmVpcEndpoint = new aws.ec2.VpcEndpoint('ssm', {
    vpcId: mainVpc.id,
    subnetIds: [privateSubnet.id],
    serviceName: 'com.amazonaws.ap-northeast-1.ssm',
    vpcEndpointType: 'Interface',
    privateDnsEnabled: true,
    securityGroupIds: [securityGroup.id],

    tags: {
        Name: config.name,
    },
});

const ec2messagesVpcEndpoint = new aws.ec2.VpcEndpoint('ec2messages', {
    vpcId: mainVpc.id,
    subnetIds: [privateSubnet.id],
    serviceName: 'com.amazonaws.ap-northeast-1.ec2messages',
    vpcEndpointType: 'Interface',
    privateDnsEnabled: true,
    securityGroupIds: [securityGroup.id],

    tags: {
        Name: config.name,
    },
});

const ssmmessagesVpcEndpoint = new aws.ec2.VpcEndpoint('ssmmessages', {
    vpcId: mainVpc.id,
    subnetIds: [privateSubnet.id],
    serviceName: 'com.amazonaws.ap-northeast-1.ssmmessages',
    vpcEndpointType: 'Interface',
    privateDnsEnabled: true,
    securityGroupIds: [securityGroup.id],

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
