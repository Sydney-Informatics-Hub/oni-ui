# Walkthrough notes


Two aspects we need to get to grips with -

- How indexing is configured
- How search results are mapped to web components

configuration is the original, api-configuration is the one I hacked in to 
get it working with a different set of paths

Two sections: ui and api


SearchComponent

CollectionComponent

ObjectComponent


A collection == OMAA or a project

an Object = an indexed entity within that

Widgets: specialised viewers - this looks like a good place to put the
mapping code

Cards: components for things like licenses, metadata links etc

ElasticSearch config

api.elastic

- fields - controls what we are mapping from RO-Crate entities 
- aggregation - 

- mappings 

# Components

Object component

ObjectPart -> MetaField / FileResolve

FileResolve -> deals with a PDF / CSV / etc.

can it do images? 

MetaField / ElasticField + ElasticResolveField + FieldHelperCard

ElasticField -> metadata field, also python notebooks

ElasticResolveField -> turns it into a URL

FieldHelperCard -> big tooltip for explaining metadata fields





// Issues 

- Develop indexing config to go from the RO-Crate to Oni's ElasticSearch

- the hide section in the config has clues to the _magic field names