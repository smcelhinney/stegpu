import {
  DescribeInstancesCommand,
  EC2Client,
  RebootInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";
import "dotenv/config";
import portscanner from "portscanner";
import { stringify } from "qs";
import { createRdpFile } from "./rdp";
import { resolve } from "path";

function getSunshineServiceUrl() {
  return `https://${process.env.SUNSHINE_USERNAME}:${process.env.SUNSHINE_PASSWORD}@${process.env.NO_IP_HOSTNAME}:47990/`;
}

async function getDnsDetails(
  instanceId: string,
  client: EC2Client
): Promise<{ dnsName: string; publicIp: string } | undefined> {
  // We need to poll the instance until it is started, so we need to retry this
  // command once every 5 seconds until the instance is started
  let retries = 0;
  const maxRetries = 20;
  while (retries < maxRetries) {
    // Check if the instance is started
    const describeInstancesCommand = new DescribeInstancesCommand({
      InstanceIds: [instanceId],
    });
    const describeInstancesResponse = await client.send(
      describeInstancesCommand
    );

    // Output the public DNS name of the first reservation
    const dnsName =
      // @ts-expect-error
      describeInstancesResponse.Reservations[0].Instances[0].PublicDnsName;
    const publicIp =
      // @ts-expect-error
      describeInstancesResponse.Reservations[0].Instances[0].PublicIpAddress;

    if (dnsName && publicIp) {
      console.log(`Instance ${instanceId} started with DNS name ${dnsName}`);
      return { dnsName, publicIp };
    }

    console.log(`Instance ${instanceId} has no dns name yet, retrying...`);

    // Wait 5 seconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 5000));
    retries++;
  }
}

async function waitForSunshineServiceToStart(dnsName: string) {
  /**
   * This function polls a URL on the instance to check if the service is running.
   * It's enough to do a HEAD request on this URL and check if the status code is 200, because
   * the service is authenticated, but we don't need to log in.
   */

  // Poll the service until it is running
  let retries = 0;
  const maxRetries = 20;
  while (retries < maxRetries) {
    // Check port status
    const portStatus = await portscanner.checkPortStatus(47990, dnsName);

    if (portStatus === "open") {
      console.log(`Sunshine Service is started`);
      return;
    }

    console.log(`Sunshine Service is not running on ${dnsName}, retrying...`);

    // Wait 5 seconds before retrying
    await new Promise((resolve) => setTimeout(resolve, 5000));
    retries++;
  }
}

async function waitForFullStartup(instanceId: string, client: EC2Client) {
  const dnsDetails = await getDnsDetails(instanceId, client);

  if (dnsDetails?.dnsName !== undefined && dnsDetails?.publicIp !== undefined) {
    await waitForSunshineServiceToStart(dnsDetails.dnsName);
  }

  return dnsDetails;
}

async function updateDynDnsWithIpAddress(dnsIp?: string) {
  if (dnsIp) {
    console.log(`Updating dynamic DNS with IP address ${dnsIp}`);
    const headers = new Headers();
    headers.set(
      "Authorization",
      "Basic " +
        btoa(process.env.NO_IP_USERNAME + ":" + process.env.NO_IP_PASSWORD)
    );

    const url = `${process.env.NO_IP_UPDATE_URL}?${stringify({
      hostname: process.env.NO_IP_HOSTNAME,
      myip: dnsIp,
    })}` as string;

    const response = await fetch(url, {
      headers,
    });

    if (response.ok) {
      console.log(
        `Dynamic DNS updated successfully\n - visit ${getSunshineServiceUrl()} to set Sunshine PIN`
      );
    }
  }
}

export const getStatus = async () => {
  const client = new EC2Client();

  const instanceId = process.env.INSTANCE_ID as string;
  const describeInstancesCommand = new DescribeInstancesCommand({
    InstanceIds: [instanceId],
  });

  const responseJson = await client.send(describeInstancesCommand);
  const instanceState =
    responseJson?.Reservations?.[0]?.Instances?.[0]?.State?.Name ?? "unknown";
  console.log(`Instance ${instanceId} is ${instanceState}`);
};

export const startInstance = async () => {
  const client = new EC2Client();

  const instanceId = process.env.INSTANCE_ID as string;
  try {
    // Start instance using instance id
    const startInstanceCommand = new StartInstancesCommand({
      InstanceIds: [instanceId],
    });
    await client.send(startInstanceCommand);
    const dnsDetails = await waitForFullStartup(instanceId, client);
    await updateDynDnsWithIpAddress(dnsDetails?.publicIp);
  } catch (error: any) {
    if (error?.name === "IncorrectInstanceState") {
      console.error(
        `Instance ${instanceId} cannot be started at this time. ${error.message}`
      );
    }
  }
};

export const stopInstance = async () => {
  const client = new EC2Client();

  const instanceId = process.env.INSTANCE_ID as string;
  try {
    // Stop instance using instance id
    const stopInstanceCommand = new StopInstancesCommand({
      InstanceIds: [instanceId],
    });
    await client.send(stopInstanceCommand);
    console.log(`Instance ${instanceId} stopped`);
  } catch (error) {
    console.error(error);
  }
};

export const restartInstance = async () => {
  const client = new EC2Client();
  const instanceId = process.env.INSTANCE_ID as string;
  try {
    // Restart instance using instance id
    const restartInstanceCommand = new RebootInstancesCommand({
      InstanceIds: [instanceId],
    });
    await client.send(restartInstanceCommand);
    console.log(`Instance ${instanceId} restarted`);
    await waitForFullStartup(instanceId, client);
  } catch (error) {
    console.error(error);
  }
};

export const createRdp = async () => {
  const client = new EC2Client();
  const instanceId = process.env.INSTANCE_ID as string;
  const dnsDetails = await getDnsDetails(instanceId, client);
  const rdpFilePath = resolve(__dirname, "gaming-machine.rdp");
  createRdpFile(
    process.env.WINDOWS_MACHINE_USERNAME as string,
    dnsDetails?.publicIp as string,
    process.env.WINDOWS_MACHINE_PASSWORD as string,
    rdpFilePath
  );
};
