#!/bin/bash

#BRANCH=$1
BRANCH_DIRECTORY=$1

echo "Checking local tracking branch vs remote upstream branch...."
if [ -d "$BRANCH_DIRECTORY" ]
        then
        cd "$BRANCH_DIRECTORY"
        branch=$(git rev-parse --abbrev-ref HEAD)
        echo "checing branch: $branch"
        # Check if the current local tracking branch revision is the same as the remote branch
        # This only does a network request, no objects are grabbed.
        # The benefit is that we don't need to run git clean or clear varnish's cache unless the branch revision is different to the remote.
        localRev=$(git rev-parse HEAD)
        remoteRev=$(git ls-remote origin -h "$branch" | cut -f1)
        echo "Local revison:  $localRev"
        echo "Remote revison: $remoteRev"
        if [[ "$localRev" != "$remoteRev" ]]
        then
                echo "branch revision is not the same"
                git pull --ff-only
                #updateBranch $BRANCH
        else
                echo "branch is up to date"
        fi
else
        echo "$BRANCH_DIRECTORY does not exist"
fi