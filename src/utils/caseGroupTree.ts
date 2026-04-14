import type {IGroup} from "../models/case/group.ts";

export const buildGroupPathMap = (groups: IGroup[]): Map<number, string> => {
    const groupById = new Map(groups.map(group => [group.id, group]));
    const pathById = new Map<number, string>();

    const resolvePath = (groupId: number, trail: Set<number>): string => {
        const cached = pathById.get(groupId);
        if (cached) {
            return cached;
        }

        const group = groupById.get(groupId);
        if (!group) {
            return `Group #${groupId}`;
        }

        if (trail.has(groupId)) {
            return group.name;
        }

        if (group.parentId == null) {
            pathById.set(groupId, group.name);
            return group.name;
        }

        const nextTrail = new Set(trail);
        nextTrail.add(groupId);

        const parentPath = resolvePath(group.parentId, nextTrail);
        const path = `${parentPath} / ${group.name}`;
        pathById.set(groupId, path);
        return path;
    };

    for (const group of groups) {
        resolvePath(group.id, new Set<number>());
    }

    return pathById;
};

export const buildGroupOptions = (groups: IGroup[]) => {
    const pathMap = buildGroupPathMap(groups);

    return groups
        .map(group => ({
            value: group.id,
            label: pathMap.get(group.id) ?? group.name,
        }))
        .sort((left, right) => left.label.localeCompare(right.label));
};
