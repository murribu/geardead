#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GeardeadStack } from "../lib/geardead-stack";
const region = "us-east-1";

const app = new cdk.App();
new GeardeadStack(app, "GeardeadStack", { env: { region } });
