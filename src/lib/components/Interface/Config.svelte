<script lang="ts">
  import { isEditing } from "../../store/store";
</script>

<div class="card card-compact bg-base-100 shadow-xl">
  <div class="card-body space-y-1">
    <div class="form-control">
      <label class="label cursor-pointer">
        <span class="label-text font-bold uppercase">Edit Map</span>
        <input
          type="checkbox"
          class="toggle toggle-primary"
          checked={$isEditing}
          on:change={(e) => {
            // @ts-ignore
            const isChecked = !!e.target.checked;

            isEditing.set(isChecked);
          }}
        />
      </label>
    </div>
  </div>
</div>
