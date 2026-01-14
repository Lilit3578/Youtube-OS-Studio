import InspectorView from "@/components/tools/metadata/InspectorView";

export default function MetadataPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Video Metadata Inspector</h1>
            <InspectorView />
        </div>
    );
}
