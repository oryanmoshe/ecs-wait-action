const core = require("@actions/core");
const AWS = require("aws-sdk");

/**
 * Waits for given AWS ECS services transition into "servicesStable" state.
 * Times out after 10 minutes.
 * @param   {Object}   params
 * @param   {AWS.ECS}  params.ecsConnection - An AWS ECS connection object
 * @param   {string}   params.cluster       - The name of the ECS cluster
 * @param   {string[]} params.services      - A list of ECS services to check for stability
 * @returns {Promise}                         A promise to be resolved when services are stable or rejected after the timeout
 */
const waitForStability = ({ ecsConnection, cluster, services }) =>
  ecsConnection.waitFor("servicesStable", { cluster, services }).promise();

/**
 * Retries the ECS services stability check for the given amount of retries.
 * @param   {Object}   params
 * @param   {number}   params.retries - The number of times to retry the stability check
 * @param   {boolean}  params.verbose - Whether to print verbose log messages
 * @param   {Object}   params.params  - The rest of the parameters
 * @returns {number}                    The number of tries we did
 */
const retry = async ({ retries, verbose, ...params }) => {
  let currTry = 1;
  let isStable = false;
  while (currTry <= retries && !isStable) {
    try {
      if (verbose) {
        console.info(`Waiting for service stability, try #${currTry}`);
      }
      await waitForStability(params);
      isStable = true;
    } catch {
      if (verbose) {
        console.warn(`Try #${currTry} failed!`);
      }
      ++currTry;
    }
  }

  return currTry;
};

/**
 * Creates an AWS ECS connection using the given credentials.
 * @param   {Object}  params
 * @param   {string}  params.accessKeyId     - The AWS_ACCESS_KEY_ID
 * @param   {string}  params.secretAccessKey - The AWS_SECRET_ACCESS_KEY
 * @param   {string}  params.region          - The AWS_REGION
 * @returns {AWS.ECS}                          An AWS ECS connection object
 */
const createEcsConnection = ({ accessKeyId, secretAccessKey, region }) =>
  new AWS.ECS({
    apiVersion: "2014-11-13",
    accessKeyId,
    secretAccessKey,
    region
  });

/**
 * The GitHub Action entry point.
 */
const main = async () => {
  try {
    const params = {
      accessKeyId: core.getInput("aws-access-key-id"),
      secretAccessKey: core.getInput("aws-secret-access-key"),
      region: core.getInput("aws-region"),
      retries: parseInt(core.getInput("retries"), 10),
      cluster: core.getInput("ecs-cluster"),
      services: JSON.parse(core.getInput("ecs-services")),
      verbose: core.getInput("verbose") === "true"
    };

    const ecsConnection = createEcsConnection(params);
    params["ecsConnection"] = ecsConnection;

    const actualRetries = retry(params);
    if (actualRetries > params.retries) {
      if (params.verbose) {
        console.error(`Service is not stable after ${params.retries} retries!`);
      }
      core.setFailed(`Service is not stable after ${params.retries} retries!`);
    } else {
      if (params.verbose) {
        console.log(`Service is stable after ${actualRetries} retries!`);
      }
      core.setOutput("retries", actualRetries);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
};

main();
