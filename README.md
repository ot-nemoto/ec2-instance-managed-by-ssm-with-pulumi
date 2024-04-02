# ec2-instance-managed-by-ssm-with-pulumi

-   SSM で管理するプライベートネットワークのインスタンスを作成する

## デプロイ

### 事前準備

```sh
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
```

### 新規 VPC/Subnet 上にインスタンスを作成

スタック作成

```sh
pulumi stack init STACK_NAME
```

インフラストラクチャの作成

```sh
pulumi up
```

### 既存 VPC/Subnet 上にインスタンスを作成

スタック作成

```sh
pulumi stack init STACK_NAME
```

VPC/Subnet を指定

```sh
pulumi config set vpc_id VPC_ID
pulumi config set subnet_id SUBNET_ID
```

インフラストラクチャの作成

```sh
pulumi up
```

## Commands

スタック一覧

```sh
pulumi stack ls
```

スタックを選択

```sh
pulumi stack select STACK_NAME
```

インフラストラクチャの削除

```sh
pulumi destroy
```

スタックの削除

```sh
pulumi stack rm STACK_NAME
```
