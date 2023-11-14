# NOTES

## Initial setup

The instructions say to run the indexers on the host rather than docker, but
they use the same configuration.json - this file has paths to docker volumes
for the ocfl, but the indexers need different locations.

I got it to work by hacking a second config file for the indexers.

## Bootstrapping oni-storage

How to make an OCFL repository:

- put the RO-Crate(s) you want to index in ./samples/test-oni/
- make sure that ./oni-storage exists in this repo
- run 'npm install' if you haven't already
- run 'node make-oni-storage.js'

If there's no ocfl dir under ./oni-storage, this will create one and add the
contents of ./samples/test-oni/.  If the ocfl repo already exists, the contents
of ./samples/test-oni/ will be checked in as a new version.

Note that this script requires that the RO-Crate conform to the LDaCA rule that
the crate id has to be an arpc name url like "arcp://name,testing-crate-o" -
this is both because the LDaCA profile requires it, and because Oni expects
that the RO-Crate's object will have a path derived from the arcp URL.
make-oni-storage.js converts whatever arcp url it finds into the right path.

The sample crate in ./samples/test-oni has a valid arcp URL.

Improvements - the input and output directory should both be configurable on
the command line.

## Hacking ro-crates to be indexed

Root entity must be a RepositoryCollection

This must have RepositoryObjects as members (memberOf not partOf)

the root entity has to have a conformsTo: [ Purl for RepositoryCollection ]

The path in the ocfl must match the arcp url

The collection must have a hasPart

The object also needs a conformsTo