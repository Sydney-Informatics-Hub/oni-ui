# NOTES

The instructions say to run the indexers on the host rather than docker, but
they use the same configuration.json - this file has paths to docker volumes
for the ocfl, but the indexers need different locations.

I got it to work by hacking a second config file for the indexers.

///

Hacking ro-crates to be indexed

Root entity must be a RepositoryCollection

This must have RepositoryObjects as members (memberOf not partOf)

the root entity has to have a conformsTo: [ Purl for RepositoryCollection ]

The path in the ocfl must match the arcp url

The collection must have a hasPart

The object also needs a conformsTo