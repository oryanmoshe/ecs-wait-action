# AWS ECS `servicesStable` waiter (with retries)

AWS provides a way to wait for certain ECS services to become `stable`, but this command times out after 10 minutes.\
This action allows you to wait for services to become stable **and** retry the waiting process as many times as you want.

## Inputs

### `aws-access-key-id`

**Required** - _string_\
Your `AWS_ACCESS_KEY_ID`.

### `aws-secret-access-key` - ``

**Required** - _string_\
Your `AWS_SECRET_ACCESS_KEY`.

### `aws-region`

**Required** - _string_\
Your `AWS_REGION`.

### `ecs-cluster`

**Required** - _string_\
The ECS cluster that contains your services.

### `ecs-services`

**Required** - _string[]_\
A list of ECS services to make sure are stable.

### `retries`

**Required** - _integer_\
The number of times you want to try the stability check. Default `2`.

### `verbose`

_Optional_ - _boolean_\
Whether to print verbose debug messages to the console. Default `false`.

## Outputs

### `retries`

_integer_\
How many retries happened until success.

## Example usage

```yaml
uses: oryanmoshe/ecs-wait-action@v1.1
with:
  aws-access-key-id: AKIAIOSFODNN7EXAMPLE
  aws-secret-access-key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
  aws-region: us-east-1
  ecs-cluster: my-ecs-cluster
  ecs-services: '["my-ecs-service-1", "my-ecs-service-2"]'
  retries: 5
  verbose: false
```
