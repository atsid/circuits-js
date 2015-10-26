[![Code Climate](https://codeclimate.com/github/atsid/circuits-js/badges/gpa.svg)](https://codeclimate.com/github/atsid/circuits-js)
[![Build Status](https://travis-ci.org/atsid/circuits-js.svg?branch=master)](https://travis-ci.org/atsid/circuits-js)


# circuits-js
An SMD based service library.

## Overview
JavaScript components frequently need to interact with server-side data services using asynchronous HTTP requests. All major JavaScript frameworks provide abstractions over the low-level XmlHttpRequest browser object that is used to perform these requests. This allows developers to use simpler interactions, rather than concerning themselves with the details of request headers, content-types, and response codes. Data is typically returned in a “success” callback, and is usually pre-formatted for use (e.g., strings parsed as JSON into JavaScript objects or other pre-processing).
As applications scale in complexity, it becomes necessary to provide an even greater abstraction in order to encourage extremely simple code by toolkit users, particularly as the number of available web services proliferates. We have therefore generally hidden the Ajax request mechanism under “data service” – wrappers that provide methods specific to a given service (“loadX”, “saveY”), including just the parameters needed to satisfy the service request. While these service implementations do abstract the end use, they still require implementation that knows how to construct URLs, extract response payloads, and so on.
The library focuses on REST (REpresentational State Transfer) as a service paradigm, which (in short) includes the use of strict HTTP compliance and a requirement for complete information with each request (in lieu of maintaining server-side state). There are a number of reasons that this design pattern is desirable, but a couple in particular lend themselves well to JavaScript use. First is the consistency, clarity, and reliability of specifying every service using strict HTTP parameters. This allows us to clearly document every service endpoint using a formalized schema definition, which is both human- and machine-readable. This simplifies developer education as well as computer processing or other services. Second is the near-ubiquitous use of JSON (JavaScript Object Notation) as the transport language, allowing for simplified browser (or other platform) processing of service payloads.
The overall intent of using a standard specification is the subsequent ability to use tools that automatically handle developer boilerplate, validation, and so on. The intent of circuits-js therefore is to create a RESTful service wrapper that allows developers to simply specify a service specification by name, and receive an object that they can invoke methods on corresponding to those available on the service. All URL resolution, Ajax, and response pre-processing is completely abstracted so that developers can concentrate on the objects they need, and not on IO operations. In other words, no services should require a specific service implementation to be coded by a developer – instead, these services should be entirely auto-generated by a component that understands a formal specification and can handle all required processing to get data to the developer at point of use.
## Service Specifications
All service endpoints are specified using JSON. The primary reasons for this are that JSON is lightweight, web native, and readable by any modern programming language. This allows us to write schema definitions once, and have them utilizable by both the client application code directly, and by server-side code that is typically written in Java or other languages.
In order to maintain consistency, service schemas are written using a pre-defined set of JSON objects that specify the properties available to describe any component. For web services, this necessarily requires the use of two interdependent schema types.
Descriptors of individual objects (request or response payloads and the subobjects contained with them) are written using JSONSchema, a formal IETF specification (draft) for describing JSON objects using JSON itself (http://tools.ietf.org/html/draft-zyp-json-schema-03). Numerous parsers and validators exist for JSONSchema, allowing easy adoption by client and server components.
While JSONSchema is used to describe any JSON object, descriptors for service endpoints themselves are actually an example of an object instance that would be described using JSONSchema. In other words, JSONSchema specifies how to describe objects, and service schemas themselves are instances that have a JSONSchema file describing what they should look like (required properties such as url, query parameters, content-type, and so on). So the schema for a service endpoint is an object which itself can be validated using JSONSchema, whereas the payload schemas are direct JSONSchema files that describe the instance returned from the live service.
Because the service endpoints are instances themselves, we must choose a schema format to reliably describe all of the elements for a RESTful service. Fortunately, others have already attempted this with some success. There are two primary public schemas available for describing REST services, and we intend support both of them.
## Zyp Service Mapping Descriptor (SMD) Proposal
Kris Zyp, the original author of JSONSchema, proposed a set of properties for defining RPC in general (including RESTful variants), and published this proposal in 2008 on a Google Group dedicated to its advancement. He called this schema a “Service Mapping Descriptor”, which is the term we use today to refer to these types of schemas in general.
The Dojo Toolkit immediately supported this proposal, but subsequent work on it declined as REST in particular came to dominate practical service design. The original proposal’s support for describing many different RPC mechanisms led to a feeling of over-complexity as only a subset of the features were needed to describe RESTful services.
The Google Group where this proposal was found is now offline, though we have transcribed the original content into a JSONSchema file that describes all of its properties. We currently support this as the first and originally more widely-used of SMD formats.
## Core API
Fundamentally, the service subsystem requires only two outward mechanisms.
* A mechanism for obtaining service operator objects by name (i.e., a factory), and
* Methods on the service operator that invoke the server and return successful data packages

In practice, this subsystem will contain several other components in order to provide strong project decoupling, validation capabilities, and runtime flexibility. The components of the service subsystem are described below.

## Service Factory
The service factory is responsible for using a schema to instantiate Service instance wrappers that handle the actual Ajax calls. The service factory is also where global configuration is specified, in order to make the component usable by any project and allow for test-specific setup.
## SMDReader
SMD Readers are the processors of specific SMD schema types. The only one we currently support out-of-the-box is the Zyp format. Services will use public methods readers to request any information they need from the underlying document to construct a request.
## Service
The service object is an instance sent from the factory, containing methods corresponding to every service method defined in a given SMD. This object also has additional helper methods for managing and configuring the invocation of each method as needed.
## ServiceMethod
Instances of a ServiceMethod are created for each method defined on the SMD, and attached to a Service. These methods are where the actual Ajax request happens under the hood.
## Request
The Request is a container that is returned from all asynchronous method invocations. This container includes the original service parameters so they can be inspected upon return, as well as a cancel mechanism in order to discard superseded calls.
## Plugin
A plugin is a function that is applied at some stage in the request/response process in order to provide modification or override of specific phases. In fact, all operations will be constructed using plugin chains, in order to ensure high configurability of the system. The “type” of a plugin indicates what phase it is applied within. Plugins can be specified globally (all services and all methods), at service level (all methods on an individual service), and method-specific (only one named method on one service).
All plugins are applied in the order received, and can be added or removed at runtime as needed.
Plugin types supported:
*	“read” – these plugins are applied after the response has returned from the server. The plugin function is executed for every item in the response, for all method types. Typical use is for data transformation or the creation of transient convenience properties. Response validation also typically executes here.
*	“write” – these plugins are applied before the request is sent to the service. The plugin function is executed for every item in the request payload, and therefore only applies to requests with an entity body (POST/PUT). This plugin is typically used for data transformation, but request validation could also executes here.
*	“url’” – these plugins are applied to the generated URL before the request is sent to the service. Typical use is to add global params, cache-busting params, or redirection.
*	“request” – this plugin is applied before the request is sent to the service, but is applied to the entire message body, not just individual items. It is applied before the “write” plugins, and can be used for wholesale request transformation or validation.
*	“response” – this plugin is applied before the response is processed, but is applied to the entire response body, not just individual items. It is applied before the “read” plugins, and can be used for wholesale response transformation or validation.
*	“handler” – this plugin type is used to process either the completed response or an error that occurs during the request/response cycle, it uses a statusPattern property that contains a regular expression to match against the http status code.

Special plugin types (not strictly part of the cycle)
*	“mixin” – this plugin type is applied to the Service instance when it is created by the factory. It is used to add custom methods to the service, such as wrappers for compatibility with other APIs such as the dojo read API.
* 'provider' - this plugin type is used to supply a circuits DataProvider that will override the factory-configured
              provider. The supplied function is expected to return a circuits/DataProvider derived object and
              is of the form: function({circuits.ServiceMethod} serviceMethod).
* 'progress' - a plugin to respond to progress information for uploads and downloads. It accepts the three xhr arguments:
              boolean lengthComputable - whether "total" is valid for computing progress,
              number loaded - size that has been transfered so far,
              number total - total size if known

Each plugin object has a name for identification, a type as described above, the function to execute, and a pointcut regular expression string or pattern regular expression string indicating what services and methods it is applied to (in the spirit of aspect-oriented programming). Circuits-js includes many plugins out of the box to meet common needs.

##License
This software is licensed under the Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0).
