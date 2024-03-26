# ec2-instance-managed-by-ssm-with-pulumi

-   SSM で管理するプライベートネットワークのインスタンスを作成する

### 事前準備

```sh
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
```

### インフラストラクチャの作成

```sh
pulumi up
```

### インフラストラクチャの削除

```sh
pulumi destroy
```
